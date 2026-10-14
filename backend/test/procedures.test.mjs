import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixture.mjs';

test('vinculación inversa, permisos, uso único, caducidad y recuperación del reloj',async()=>{
 const f=await fixture(); const requests=[];
 try {
  const a=await f.account(), b=await f.account();
  const start=async()=>{const r=await f.request('/api/pairings/start','POST',{});assert.equal(r.status,201);const x=await r.json(); requests.push(x.id);return x;};
  const x=await start();assert.match(x.code,/^\d{6}$/);assert.equal(x.qr,`mova://pair?code=${x.code}`);assert.ok(!x.token);
  const claim=(token,code=x.code,profileId=a.profile.id)=>f.request('/api/pairings/claim','POST',{code,profileId},token);
  assert.equal((await claim('')).status,401);assert.equal((await claim(b.token)).status,404);
  let r=await claim(a.token); assert.equal(r.status,200); const {device}=await r.json();f.devices.push(device.id);
  assert.equal((await claim(a.token)).status,400);
  r=await f.request('/api/pairings/status','POST',{secret:x.secret});assert.equal(r.status,200);const paired=await r.json();assert.equal(paired.status,'paired');assert.ok(paired.token.startsWith('dev_'));
  assert.equal((await f.request(`/api/devices/${device.id}/state`,'GET',undefined,paired.token)).status,200);
  const again=await f.request('/api/pairings/status','POST',{secret:x.secret}).then(r=>r.json());assert.equal(again.token,paired.token);
  await f.request(`/api/devices/${device.id}`,'DELETE',undefined,a.token);
  assert.equal((await f.request('/api/pairings/status','POST',{secret:x.secret})).status,410);
  const expired=await start();await f.pool.query("UPDATE pairing_requests SET expires_at=now()-interval '1 second' WHERE id=$1",[expired.id]);
  assert.equal((await claim(a.token,expired.code)).status,400);
  assert.equal((await f.request('/api/pairings/status','POST',{secret:expired.secret})).status,410);
  const concurrent=await start();const winners=await Promise.all([claim(a.token,concurrent.code),claim(a.token,concurrent.code)]);assert.deepEqual(winners.map(r=>r.status).sort(),[200,400]);for(const r of winners)if(r.status===200)f.devices.push((await r.json()).device.id);
 } finally {await f.pool.query('DELETE FROM pairing_requests WHERE id=ANY($1::uuid[])',[requests]);await f.cleanup();}
});

test('SP principal detiene el flujo y revierte escrituras si falla un paso hijo',async()=>{
 const f=await fixture();
 try {
  const a=await f.account(), id=await f.device(a);
  const counts=async()=> (await f.pool.query(`SELECT (SELECT count(*) FROM wearable_syncs WHERE device_id=$1)::int AS syncs,(SELECT count(*) FROM emotion_entries WHERE device_id=$1)::int AS emotions,(SELECT count(*) FROM audit_logs WHERE resource_id=$1)::int AS audits`,[id])).rows[0];
  const before=await counts();
  const bad=await f.request(`/api/devices/${id}/state`,'PATCH',{mood:'Bien',tags:['no-existe'],battery:90},a.token);assert.equal(bad.status,400);assert.deepEqual(await counts(),before);
  assert.equal((await f.pool.query('SELECT count(*)::int AS n FROM wearable_states WHERE device_id=$1',[id])).rows[0].n,0);
  const db=await f.pool.connect();
  try {
   await db.query('BEGIN');
   // A temporary audit constraint makes the final required child fail, after the emotion insert.
   await db.query(`ALTER TABLE audit_logs ADD CONSTRAINT test_fail_emotion CHECK(actor_user_id <> '${a.user.id}'::uuid OR action<>'emotion.register') NOT VALID`);
   await assert.rejects(()=>db.query('CALL sp_registrar_emocion($1,NULL,$2,$3,$4,NULL)',[a.user.id,id,a.profile.id,JSON.stringify({mood:'Bien',followupSeconds:30})]),e=>e.code==='23514');
   await db.query('ROLLBACK');
  }finally{db.release();}
  assert.deepEqual(await counts(),before);
  // Concurrent changes remain independent and all calls can finish without deadlocks.
  const updates=await Promise.all(Array.from({length:6},(_,n)=>f.request(`/api/devices/${id}/state`,'PATCH',{battery:80+n},a.token)));
  updates.forEach(r=>assert.equal(r.status,200));
  const valid=await f.request(`/api/devices/${id}/state`,'PATCH',{mood:'Bien'},a.token);assert.equal(valid.status,200);
 }finally{await f.cleanup();}
});
