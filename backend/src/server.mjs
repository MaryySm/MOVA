import { procedure } from './procedures.mjs';
import express from 'express';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { followupSeconds, enrichState, installEmotionRoutes } from './emotions.mjs';
import { installAuth, installPlatform, deviceAccess, requireUser, tasksFor, today, completeTask, fail, transaction, wrap } from './platform.mjs';
import { randomUUID } from 'node:crypto';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '1mb' }));

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
          Object.entries(value).some(([id, done]) => !/^[A-Za-z0-9_-]{1,80}$/.test(id) || typeof done !== 'boolean')) return false;
    } else if (key === 'heartRate') {
      if (!Number.isFinite(value) || value < 0 || value > 300) return false;
    } else if (key === 'note') {
      if (typeof value !== 'string' || value.length > 2000) return false;
    } else if (key === 'tags') {
      if (!Array.isArray(value) || value.length > 12 || value.some(v => typeof v !== 'string')) return false;
    } else if (key === 'steps') {
      if (!Number.isInteger(value) || value < 0) return false;
    } else if (key === 'battery') {
      if (!Number.isInteger(value) || value < 0 || value > 100) return false;
    } else return false;
  }
  return true;
}

async function saveSync(req,deviceId,payload,patch) {
 return transaction(pool,async db=>{
  const result=await procedure(db,'sp_procesar_sincronizacion',[req.principal.userId||null,req.principal.deviceId||null,deviceId,JSON.stringify(payload),patch?JSON.stringify(patch):null,followupSeconds],true);
  return {...result,state:await readState(db,deviceId)};
 });
}
async function readState(client, deviceId) {
  const result = await client.query('SELECT device_id AS "deviceId", payload, updated_at AS "updatedAt" FROM wearable_states WHERE device_id=$1', [deviceId]);
  const state=result.rows[0] || {deviceId,payload:{...defaultState},updatedAt:null};
  const device=(await client.query('SELECT profile_id FROM devices WHERE id=$1',[deviceId])).rows[0];
  if(device?.profile_id) {
    const date=await today(client,device.profile_id);
    state.tasks=await tasksFor(client,device.profile_id,date);
    state.date=date;
    state.payload.activities=Object.fromEntries(state.tasks.flatMap(t=>[[t.id,t.done],...(t.legacy_key?[[t.legacy_key,t.done]]:[])]));
    state.settings=(await client.query('SELECT * FROM profile_settings WHERE profile_id=$1',[device.profile_id])).rows[0];
  }
  return enrichState(client,state);
}
installAuth(app,pool);
installPlatform(app,pool);
installEmotionRoutes(app, pool, validDevice, readState);
app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); }
  catch { res.status(503).json({ error: 'Base de datos no disponible' }); }
});
app.get('/api/devices/:deviceId/state', async (req, res) => {
  const { deviceId } = req.params;
  if (!validDevice(deviceId)) return res.status(400).json({ error: 'Dispositivo inválido' });
  try {
    await deviceAccess(pool,req,deviceId);
    const state = await readState(pool, deviceId);
    res.setHeader('Cache-Control', 'no-store');
    res.json(state);
  } catch(error) { res.status(error.status||503).json({ error: error.status?error.message:'Base de datos no disponible' }); }
});
app.patch('/api/devices/:deviceId/state', async (req, res) => {
  if (!validDevice(req.params.deviceId) || !validPatch(req.body)) return res.status(400).json({ error: 'Estado inválido' });
  try {
    const result = await saveSync(req,req.params.deviceId, req.body, req.body);
    res.json(result.state);
  } catch (error) { console.error(error.message); res.status(error.status||503).json({ error: error.status?error.message:'No se pudo guardar' }); }
});
app.post('/api/sync', async (req, res) => {
  const { deviceId = null, payload } = req.body ?? {};
  if ((deviceId !== null && !validDevice(deviceId)) || !payload || typeof payload !== 'object' || Array.isArray(payload))
    return res.status(400).json({ error: 'deviceId inválido o payload no es un objeto JSON' });
  const patch = Object.fromEntries(Object.entries(payload).filter(([key]) => ['mood', 'activities', 'sos', 'heartRate','note','tags','steps','battery'].includes(key)));
  if (Object.keys(patch).length && !validPatch(patch)) return res.status(400).json({ error: 'Estado inválido' });
  try { res.status(201).json(await saveSync(req,deviceId,payload,Object.keys(patch).length ? patch : null)); }
  catch (error) { console.error(error.message); res.status(error.status||503).json({ error: error.status?error.message:'No se pudo guardar' }); }
});
app.get('/api/sync',wrap(async(req,res)=>{
 const deviceId=req.query.deviceId;
 if(deviceId) await deviceAccess(pool,req,deviceId);
 else requireUser(req);
 const result=await pool.query(`SELECT s.id,s.device_id AS "deviceId",s.payload,s.synced_at AS "syncedAt"
 FROM wearable_syncs s JOIN devices d ON d.id=s.device_id
 WHERE ($1::text IS NULL OR d.id=$1) AND (d.id=$2 OR EXISTS(SELECT 1 FROM profile_members WHERE profile_id=d.profile_id AND user_id=$3))
 ORDER BY s.synced_at DESC,s.id DESC LIMIT 100`,[deviceId||null,req.principal.deviceId||null,req.principal.userId||null]);res.json(result.rows);
}));
app.use((error,req,res,next)=>{
 if(res.headersSent)return next(error);
 const status=error.status||(error.code==='23505'?409:error.code==='22007'||error.code==='22008'||error.code==='22P02'||error.code==='23514'?400:500);
 if(status>=500)console.error(error.message);
 res.status(status).json({error:error.status?error.message:status===409?'El registro ya existe':status===400?'Datos inválidos':'Error interno. Intenta nuevamente.'});
});

// Also migrate existing volumes: init.sql in the Docker entrypoint only runs for a new database.
await pool.query(await readFile(new URL('../db/init.sql', import.meta.url), 'utf8'));
await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
await transaction(pool,async db=>{
 await db.query('SELECT pg_advisory_xact_lock(2841)');
 for(const version of ['002-platform','003-procedures','004-lock-order','005-location']) {
  const applied=await db.query('SELECT version FROM schema_migrations WHERE version=$1',[version]);
  if(!applied.rows.length) {
   await db.query(await readFile(new URL(`../db/migrations/${version}.sql`,import.meta.url),'utf8'));
   await db.query('INSERT INTO schema_migrations(version) VALUES($1)',[version]);
  }
 }

});
app.listen(Number(process.env.PORT ?? 3000), () => console.log('MOVA API listening'));
