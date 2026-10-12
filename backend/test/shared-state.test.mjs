import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixture.mjs';
test('cuentas, permisos, vinculación, tareas, agenda, sensores y avisos',async()=>{
 const f=await fixture();
 try{
 const a=await f.account(),b=await f.account(),p=a.profile.id,id=await f.device(a);
 const c=async(path,method='GET',body,token=a.token,status=200)=>{const r=await f.request(path,method,body,token);assert.equal(r.status,status,`${method} ${path}: ${await r.clone().text()}`);return status===204?null:r.json();};
 await c('/api/profiles','GET',undefined,'',401);await c(`/api/profiles/${p}/tasks`,'GET',undefined,b.token,404);
 const {code}=await c(`/api/devices/${id}/pairing`,'POST',{});const pair=await c('/api/pairings/redeem','POST',{code},'');await c('/api/pairings/redeem','POST',{code},'',400);await c('/api/profiles','GET',undefined,pair.token,403);
 const task=await c(`/api/profiles/${p}/tasks`,'POST',{title:'Respirar',icon:'🌬️',time:'12:30',weekdays:[1,2,3,4,5,6,7]},a.token,201);
 assert.ok((await c(`/api/devices/${id}/state`)).tasks.some(t=>t.id===task.id));await c(`/api/devices/${id}/state`,'PATCH',{activities:{[task.id]:true}},pair.token);
 assert.equal((await c(`/api/profiles/${p}/tasks`)).tasks.find(t=>t.id===task.id).done,true);assert.equal((await c(`/api/profiles/${p}/tasks?date=2020-01-01`)).tasks.find(t=>t.id===task.id).done,false);
 const event=await c(`/api/profiles/${p}/calendar`,'POST',{title:'Terapia',startsAt:'2026-11-01T10:00:00Z',endsAt:'2026-11-01T11:00:00Z',notes:'Sala 2'},a.token,201);await c(`/api/calendar/${event.id}`,'PATCH',{notes:'Sala 3'});assert.equal((await c(`/api/profiles/${p}/calendar`))[0].notes,'Sala 3');
 await c(`/api/profiles/${p}/members`,'POST',{email:b.user.email,role:'viewer'},a.token,204);await c(`/api/profiles/${p}/tasks`,'GET',undefined,b.token);await c(`/api/tasks/${task.id}`,'PATCH',{title:'Prohibido'},b.token,403);
 await c(`/api/devices/${id}/state`,'PATCH',{mood:'Bien',note:'Un buen día',tags:['calm'],heartRate:82,steps:200,battery:90},pair.token);
 const h=await c(`/api/profiles/${p}/emotions`);assert.equal(h.entries[0].note,'Un buen día');assert.equal(h.summary.day.total,1);assert.equal(h.entries[0].tags.length,1);
 await c(`/api/profiles/${p}/emotions`,'POST',{mood:'Triste'},a.token,201);assert.equal((await c(`/api/profiles/${p}/emotions`)).summary.day.total,2);
 await c(`/api/devices/${id}/state`,'PATCH',{sos:true},pair.token);await c(`/api/devices/${id}/state`,'PATCH',{sos:false},pair.token,403);await c(`/api/devices/${id}/state`,'PATCH',{sos:false});assert.ok((await c(`/api/profiles/${p}/sos`))[0].acknowledged_at);
 assert.equal((await c(`/api/devices/${id}/telemetry`))[0].heart_rate,82);await c(`/api/profiles/${p}/settings`,'PATCH',{sound:false,intensity:3});assert.equal((await c(`/api/devices/${id}/state`)).settings.sound,false);
 const n=await c(`/api/profiles/${p}/notifications`);assert.ok(n.length>=3);await c(`/api/notifications/${n[0].id}/read`,'POST',{},a.token,204);assert.ok((await c(`/api/profiles/${p}/notifications`))[0].read_at);
 await c(`/api/calendar/${event.id}`,'DELETE',undefined,a.token,204);await c(`/api/tasks/${task.id}`,'DELETE',undefined,a.token,204);await c(`/api/devices/${id}`,'DELETE',undefined,a.token,204);await c(`/api/devices/${id}/state`,'GET',undefined,pair.token,401);const restored=await c('/api/devices','POST',{id,name:'Reactivado',profileId:p},a.token,201);assert.equal(restored.id,id);
 const logged=await c('/api/auth/login','POST',{email:a.user.email,password:'MovaTest2026!'},'');
 await c('/api/auth/password','POST',{currentPassword:'MovaTest2026!',newPassword:'MovaNueva2026!'},a.token,204);
 await c('/api/auth/me','GET',undefined,logged.token,401);
 await c('/api/auth/login','POST',{email:a.user.email,password:'MovaTest2026!'},'',401);
 await c('/api/auth/login','POST',{email:a.user.email,password:'MovaNueva2026!'},'');
 await c('/api/auth/logout','POST',{},a.token,204);await c('/api/auth/me','GET',undefined,a.token,401);
 }finally{await f.cleanup();}
});
