import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.MOVA_TEST_API_URL || 'http://localhost:3000';
const device = `test-${randomUUID()}`;
const endpoint = `${base}/api/devices/${device}/state`;
const patch = body => fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const getState = async () => {
  const response = await fetch(endpoint);
  assert.equal(response.status, 200);
  return response.json();
};

test('estado compartido, historial, aislamiento, validación y CORS', async () => {
  const initial = await getState();
  assert.deepEqual(initial.payload, { mood: null, activities: {}, sos: false });
  assert.equal(initial.updatedAt, null);
  let response = await patch({ mood: 'Bien', activities: { a1: true }, sos: true });
  assert.equal(response.status, 200);
  let saved = await response.json();
  assert.ok(saved.updatedAt);
  assert.equal(saved.payload.mood, 'Bien');
  assert.equal(saved.payload.sos, true);

  const simultaneous = await Promise.all([patch({ activities: { a2: true } }), patch({ activities: { a3: true } }), patch({ mood: 'Triste' })]);
  simultaneous.forEach(r => assert.equal(r.status, 200));
  saved = await getState();
  assert.deepEqual(saved.payload.activities, { a1: true, a2: true, a3: true });
  assert.equal(saved.payload.mood, 'Triste');
  assert.equal(saved.payload.sos, true);

  response = await patch({ sos: false });
  assert.equal(response.status, 200);
  assert.equal((await getState()).payload.sos, false);
  response = await fetch(`${base}/api/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: device, payload: { heartRate: 82, raw: 'BLE test' } }) });
  assert.equal(response.status, 201);
  assert.equal((await getState()).payload.heartRate, 82);

  for (const invalid of [{}, { sos: 'true' }, { mood: 5 }, { activities: { a8: true } }, { activities: { a1: 1 } }, { heartRate: -1 }, { profile: 'x' }]) {
    assert.equal((await patch(invalid)).status, 400);
  }
  assert.equal((await getState()).payload.heartRate, 82);
  const other = await fetch(`${base}/api/devices/other-${randomUUID()}/state`).then(r => r.json());
  assert.equal(other.payload.mood, null);
  const history = await fetch(`${base}/api/sync?limit=200`).then(r => r.json());
  assert.equal(history.filter(row => row.deviceId === device).length, 6);

  const preflight = await fetch(endpoint, { method: 'OPTIONS', headers: { Origin: 'http://localhost:8445', 'Access-Control-Request-Method': 'PATCH', 'Access-Control-Request-Headers': 'content-type' } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://localhost:8445');
  const denied = await fetch(endpoint, { headers: { Origin: 'https://untrusted.example' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});
