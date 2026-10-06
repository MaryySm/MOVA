import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const base = process.env.MOVA_TEST_API_URL || 'http://localhost:3000';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || process.env.MOVA_TEST_DATABASE_URL || 'postgres://mova:mova_dev_password@localhost:5432/mova' });
const device = `emotion-test-${randomUUID()}`;
const url = `${base}/api/devices/${device}`;
const post = (path, body = {}) => fetch(`${url}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const register = async mood => {
  const response = await fetch(`${url}/state`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mood }) });
  assert.equal(response.status, 200);
  return response.json();
};
const report = async (cursor = '') => fetch(`${url}/emotions${cursor ? `?before=${cursor}` : ''}`).then(r => r.json());

test('historial, seguimiento único y porcentajes por calendario chileno', async () => {
  try {
    let state = await register('Bien');
    const first = state.followUp.id;
    assert.ok(state.followUp.dueAt);
    assert.ok(Math.abs(Date.parse(state.followUp.dueAt) - Date.parse(state.followUp.recordedAt) - 30000) < 1000);
    assert.equal((await post(`/emotions/${first}/prompt`)).status, 409);
    assert.equal((await post(`/emotions/${first}/answer`, { stillFeeling: true })).status, 409);
    await pool.query("UPDATE emotion_entries SET followup_due_at=clock_timestamp()-interval '1 second' WHERE id=$1 AND device_id=$2", [first, device]);
    const prompts = await Promise.all([post(`/emotions/${first}/prompt`), post(`/emotions/${first}/prompt`)]);
    prompts.forEach(response => assert.equal(response.status, 200));
    const prompted = (await report()).entries[0];
    assert.ok(prompted.askedAt);
    assert.equal((await post(`/emotions/${first}/answer`, { stillFeeling: true })).status, 200);
    assert.equal((await post(`/emotions/${first}/answer`, { stillFeeling: true })).status, 200);
    assert.equal((await post(`/emotions/${first}/answer`, { stillFeeling: false })).status, 409);
    let history = await report();
    assert.equal(history.entries.length, 1);
    assert.equal(history.entries[0].stillFeeling, true);
    assert.ok(history.entries[0].answeredAtLocal);
    assert.equal(history.summary.day.total, 1);
    assert.equal(history.summary.day.emotions[0].percentage, 100);

    state = await register('Triste');
    const replaced = state.followUp.id;
    await register('Triste'); // Repeated labels are separate observations, not dropped.
    assert.equal((await post(`/emotions/${replaced}/prompt`)).status, 409);
    history = await report();
    assert.equal(history.entries.length, 3);
    assert.ok(history.entries.find(entry => entry.id === replaced).supersededAt);
    assert.equal(history.summary.day.total, 3);
    assert.deepEqual(history.summary.day.emotions.map(({mood, count, percentage}) => ({mood,count,percentage})), [
      { mood: 'Triste', count: 2, percentage: 66.7 }, { mood: 'Bien', count: 1, percentage: 33.3 },
    ]);

    const latest = history.entries[0].id;
    await pool.query("UPDATE emotion_entries SET followup_due_at=clock_timestamp()-interval '1 second' WHERE id=$1 AND device_id=$2", [latest, device]);
    assert.equal((await post(`/emotions/${latest}/prompt`)).status, 200);
    assert.equal((await post(`/emotions/${latest}/answer`, { stillFeeling: false })).status, 200);
    assert.equal((await report()).entries[0].stillFeeling, false);
    assert.equal((await report()).entries.length, 3);

    // Seed observations exactly around local boundaries and verify all period totals independently.
    const boundaries = await pool.query(`SELECT date_trunc('day',now() AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago' AS day,
      date_trunc('week',now() AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago' AS week,
      date_trunc('month',now() AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago' AS month`);
    for (const boundary of Object.values(boundaries.rows[0])) {
      await pool.query(`INSERT INTO emotion_entries(device_id,mood,recorded_at) VALUES($1,'Normal',$2::timestamptz-interval '1 second'),($1,'Normal',$2)`, [device, boundary]);
    }
    await pool.query(`INSERT INTO emotion_entries(device_id,mood,recorded_at)
      SELECT $1,'Normal', clock_timestamp()-interval '2 years' FROM generate_series(1,51)`, [device]);
    history = await report();
    assert.equal(history.timezone, 'America/Santiago');
    for (const [period, summary] of Object.entries(history.summary)) {
      const expected = await pool.query('SELECT mood,count(*)::int AS count FROM emotion_entries WHERE device_id=$1 AND recorded_at >= $2 AND recorded_at < $3 GROUP BY mood', [device, summary.startsAt, summary.endsAt]);
      assert.equal(summary.total, expected.rows.reduce((sum,row) => sum+row.count,0), period);
      assert.equal(summary.emotions.reduce((sum,row) => sum+row.count,0), summary.total);
    }
    assert.equal(history.entries.length, 50);
    for (let i=1; i<history.entries.length; i++) {
      assert.ok(Date.parse(history.entries[i-1].recordedAt) >= Date.parse(history.entries[i].recordedAt));
    }
    assert.ok(history.nextCursor);
    const page2 = await report(history.nextCursor);
    assert.equal(page2.entries.length, 10);
    assert.equal(page2.nextCursor, null);
    assert.ok(!page2.entries.some(entry => history.entries.some(firstPage => firstPage.id === entry.id)));
    const empty = await fetch(`${base}/api/devices/empty-${randomUUID()}/emotions`).then(r=>r.json());
    assert.equal(empty.summary.month.total, 0);
    assert.deepEqual(empty.summary.month.emotions, []);
  } finally {
    // Only this test's generated device is removed; all real/demo devices are preserved.
    await pool.query('DELETE FROM emotion_entries WHERE device_id=$1', [device]);
    await pool.query('DELETE FROM wearable_syncs WHERE device_id=$1', [device]);
    await pool.query('DELETE FROM wearable_states WHERE device_id=$1', [device]);
    await pool.end();
  }
});
