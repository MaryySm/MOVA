import express from 'express';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { recordEmotion, enrichState, installEmotionRoutes } from './emotions.mjs';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
const defaultState = { mood: null, activities: {}, sos: false };
const allowedOrigins = new Set((process.env.CORS_ORIGINS ||
  'http://localhost:8443,http://localhost:8444,http://localhost:8445,http://127.0.0.1:8443,http://127.0.0.1:8444,http://127.0.0.1:8445').split(',').map(s => s.trim()));

app.use((req, res, next) => {
  if (allowedOrigins.has(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '256kb' }));

function validDevice(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id);
}
function validPatch(patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch) || !Object.keys(patch).length) return false;
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'mood') {
      if (value !== null && (typeof value !== 'string' || !value.trim() || value.length > 80)) return false;
    } else if (key === 'sos') {
      if (typeof value !== 'boolean') return false;
    } else if (key === 'activities') {
      if (!value || typeof value !== 'object' || Array.isArray(value) ||
          Object.entries(value).some(([id, done]) => !/^a[1-7]$/.test(id) || typeof done !== 'boolean')) return false;
    } else if (key === 'heartRate') {
      if (!Number.isFinite(value) || value < 0 || value > 300) return false;
    } else return false;
  }
  return true;
}

// The database merges each activity independently so concurrent edits do not replace other activities.
async function writeState(client, deviceId, patch) {
  const result = await client.query(`
    INSERT INTO wearable_states(device_id, payload) VALUES ($1, $2::jsonb || $3::jsonb)
    ON CONFLICT (device_id) DO UPDATE SET
      payload = wearable_states.payload || $3::jsonb || jsonb_build_object('activities',
        COALESCE(wearable_states.payload->'activities', '{}'::jsonb) || COALESCE($3::jsonb->'activities', '{}'::jsonb)),
      updated_at = clock_timestamp()
    RETURNING device_id AS "deviceId", payload, updated_at AS "updatedAt"`,
    [deviceId, JSON.stringify(defaultState), JSON.stringify(patch)]);
  return result.rows[0];
}
async function saveSync(deviceId, payload, patch) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO wearable_syncs(device_id,payload) VALUES($1,$2) RETURNING id,synced_at AS "syncedAt"',
      [deviceId, JSON.stringify(payload)]);
    let state = patch ? await writeState(client, deviceId, patch) : null;
    if (patch?.mood) await recordEmotion(client, deviceId, patch.mood, result.rows[0].id);
    if (state) state = await enrichState(client, state);
    await client.query('COMMIT');
    return { ...result.rows[0], state };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
async function readState(client, deviceId) {
  const result = await client.query('SELECT device_id AS "deviceId", payload, updated_at AS "updatedAt" FROM wearable_states WHERE device_id=$1', [deviceId]);
  return enrichState(client, result.rows[0] || { deviceId, payload: defaultState, updatedAt: null });
}
installEmotionRoutes(app, pool, validDevice, readState);
app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); }
  catch { res.status(503).json({ error: 'Base de datos no disponible' }); }
});
app.get('/api/devices/:deviceId/state', async (req, res) => {
  const { deviceId } = req.params;
  if (!validDevice(deviceId)) return res.status(400).json({ error: 'Dispositivo inválido' });
  try {
    const state = await readState(pool, deviceId);
    res.setHeader('Cache-Control', 'no-store');
    res.json(state);
  } catch { res.status(503).json({ error: 'Base de datos no disponible' }); }
});
app.patch('/api/devices/:deviceId/state', async (req, res) => {
  if (!validDevice(req.params.deviceId) || !validPatch(req.body)) return res.status(400).json({ error: 'Estado inválido' });
  try {
    const result = await saveSync(req.params.deviceId, req.body, req.body);
    res.json(result.state);
  } catch (error) { console.error(error); res.status(503).json({ error: 'No se pudo guardar' }); }
});
app.post('/api/sync', async (req, res) => {
  const { deviceId = null, payload } = req.body ?? {};
  if ((deviceId !== null && !validDevice(deviceId)) || !payload || typeof payload !== 'object' || Array.isArray(payload))
    return res.status(400).json({ error: 'deviceId inválido o payload no es un objeto JSON' });
  const patch = Object.fromEntries(Object.entries(payload).filter(([key]) => ['mood', 'activities', 'sos', 'heartRate'].includes(key)));
  if (Object.keys(patch).length && !validPatch(patch)) return res.status(400).json({ error: 'Estado inválido' });
  try { res.status(201).json(await saveSync(deviceId, payload, deviceId && Object.keys(patch).length ? patch : null)); }
  catch (error) { console.error(error); res.status(503).json({ error: 'No se pudo guardar' }); }
});
app.get('/api/sync', async (req, res) => {
  const n = Math.min(Math.max(parseInt(req.query.limit ?? '50', 10) || 50, 1), 200);
  try {
    const result = await pool.query('SELECT id,device_id AS "deviceId",payload,synced_at AS "syncedAt" FROM wearable_syncs ORDER BY synced_at DESC,id DESC LIMIT $1', [n]);
    res.json(result.rows);
  } catch { res.status(503).json({ error: 'Base de datos no disponible' }); }
});

// Also migrate existing volumes: init.sql in the Docker entrypoint only runs for a new database.
await pool.query(await readFile(new URL('../db/init.sql', import.meta.url), 'utf8'));
app.listen(Number(process.env.PORT ?? 3000), () => console.log('MOVA API listening'));
