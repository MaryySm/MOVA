import crypto from 'node:crypto';
import { promisify } from 'node:util';
import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const scrypt = promisify(crypto.scrypt);
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const tokenSecret = process.env.AUTH_TOKEN_SECRET;
const tokenLifetimeSeconds = 60 * 60 * 24 * 7;

if (!tokenSecret || tokenSecret.length < 32) {
  throw new Error('AUTH_TOKEN_SECRET debe tener al menos 32 caracteres.');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));
const allowedOrigins = new Set((process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean));
app.use((req, res, next) => {
  const origin = req.get('origin');
  const localhostDevOrigin = process.env.ALLOW_LOCAL_CORS === '1' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin ?? '');
  if (origin && (allowedOrigins.has(origin) || localhostDevOrigin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.vary('Origin');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use((_req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  next();
});

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adult_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    age SMALLINT NOT NULL CHECK (age BETWEEN 1 AND 120),
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    diagnosis TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS wearable_syncs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT,
    payload JSONB NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ALTER TABLE wearable_syncs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  CREATE INDEX IF NOT EXISTS wearable_syncs_synced_at_idx ON wearable_syncs(synced_at DESC);
`;

function safeUser(row) {
  return {
    id: row.id,
    adultName: row.adult_name,
    name: row.user_name,
    age: String(row.age),
    phone: row.phone,
    email: row.email,
    diagnosis: row.diagnosis,
  };
}

function issueToken(user) {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds,
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', tokenSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;
  const expected = crypto.createHmac('sha256', tokenSecret).update(payload).digest();
  let received;
  try { received = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() / 1000 ? data : null;
  } catch { return null; }
}

function requireAuth(req, res, next) {
  const authorization = req.get('authorization') ?? '';
  const match = /^Bearer ([^ ]+)$/.exec(authorization);
  const token = match && verifyToken(match[1]);
  if (!token) return res.status(401).json({ error: 'La sesión no es válida. Inicia sesión nuevamente.' });
  req.auth = token;
  next();
}

const attempts = new Map();
function limitAuthAttempts(req, res, next) {
  const now = Date.now();
  const key = req.ip;
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 12) return res.status(429).json({ error: 'Demasiados intentos. Espera un minuto.' });
  recent.push(now);
  attempts.set(key, recent);
  next();
}

function text(value, maxLength = 160) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.post('/api/auth/register', limitAuthAttempts, async (req, res) => {
  const adultName = text(req.body?.adultName);
  const name = text(req.body?.name);
  const age = Number(req.body?.age);
  const phone = text(req.body?.phone, 32);
  const email = text(req.body?.email, 254).toLowerCase();
  const diagnosis = text(req.body?.diagnosis, 1000);
  const password = req.body?.password;
  if (!adultName || !name || !Number.isInteger(age) || age < 1 || age > 120 ||
      !/^\+?[0-9]{8,15}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Revisa tus datos. La contraseña debe tener al menos 8 caracteres.' });
  }
  const salt = crypto.randomBytes(16);
  try {
    const hash = await scrypt(password, salt, 64);
    const result = await pool.query(
      `INSERT INTO users(adult_name,user_name,age,phone,email,diagnosis,password_hash,password_salt)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,adult_name,user_name,age,phone,email,diagnosis`,
      [adultName, name, age, phone, email, diagnosis, hash.toString('hex'), salt.toString('hex')],
    );
    const user = safeUser(result.rows[0]);
    res.status(201).json({ user, token: issueToken(user), expiresIn: tokenLifetimeSeconds });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    console.error('No se pudo crear la cuenta:', error);
    res.status(503).json({ error: 'No se pudo crear la cuenta. Inténtalo nuevamente.' });
  }
});

app.post('/api/auth/login', limitAuthAttempts, async (req, res) => {
  const email = text(req.body?.email, 254).toLowerCase();
  const password = req.body?.password;
  if (!email || typeof password !== 'string') return res.status(400).json({ error: 'Ingresa correo y contraseña.' });
  try {
    const result = await pool.query(
      'SELECT id,adult_name,user_name,age,phone,email,diagnosis,password_hash,password_salt FROM users WHERE email=$1',
      [email],
    );
    const row = result.rows[0];
    if (!row) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    const candidate = await scrypt(password, Buffer.from(row.password_salt, 'hex'), 64);
    if (!crypto.timingSafeEqual(candidate, Buffer.from(row.password_hash, 'hex'))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }
    const user = safeUser(row);
    res.json({ user, token: issueToken(user), expiresIn: tokenLifetimeSeconds });
  } catch (error) {
    console.error('No se pudo iniciar sesión:', error);
    res.status(503).json({ error: 'No se pudo iniciar sesión. Inténtalo nuevamente.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,adult_name,user_name,age,phone,email,diagnosis FROM users WHERE id=$1',
      [req.auth.sub],
    );
    if (!result.rows[0]) return res.status(401).json({ error: 'La sesión ya no está disponible.' });
    res.json({ user: safeUser(result.rows[0]) });
  } catch {
    res.status(503).json({ error: 'No se pudo validar la sesión.' });
  }
});

app.post('/api/sync', requireAuth, async (req, res) => {
  const { deviceId = null, payload } = req.body ?? {};
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return res.status(400).json({ error: 'payload debe ser un objeto JSON' });
  try {
    const result = await pool.query('INSERT INTO wearable_syncs(user_id,device_id,payload) VALUES($1,$2,$3) RETURNING id,synced_at', [req.auth.sub, deviceId, JSON.stringify(payload)]);
    res.status(201).json({ id: result.rows[0].id, syncedAt: result.rows[0].synced_at });
  } catch (error) {
    console.error('No se pudo guardar la sincronización:', error);
    res.status(503).json({ error: 'No se pudo guardar' });
  }
});

app.get('/api/sync', requireAuth, async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit ?? '50', 10) || 50, 1), 200);
  try {
    const result = await pool.query('SELECT id,device_id AS "deviceId",payload,synced_at AS "syncedAt" FROM wearable_syncs WHERE user_id=$1 ORDER BY synced_at DESC LIMIT $2', [req.auth.sub, limit]);
    res.json(result.rows);
  } catch {
    res.status(503).json({ error: 'Base de datos no disponible' });
  }
});

const port = Number(process.env.PORT ?? 3000);
await pool.query(schema);
app.listen(port, () => console.log(`MOVA API listening on port ${port}`));
