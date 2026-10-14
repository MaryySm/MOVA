import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixture.mjs';
test('ubicación simulada: validación, permisos, posición más reciente y lectura compartida',async()=>{
 const f=await fixture();try{
 const a=await f.account(),b=await f.account(),id=await f.device(a);
 const path=`/api/devices/${id}/location`;
 const data={latitude:-33.4489,longitude:-70.6693,accuracy:12,source:'phone_simulated',observedAt:new Date().toISOString()};
 assert.equal(await f.request(path,'GET',undefined,a.token).then(r=>r.json()),null);
 assert.equal((await f.request(path,'POST',data,b.token)).status,404);
 assert.equal((await f.request(path,'POST',{...data,latitude:91},a.token)).status,400);
 assert.equal((await f.request(path,'POST',{...data,source:'watch_gps'},a.token)).status,400);
 assert.equal(await f.request(path,'GET',undefined,a.token).then(r=>r.json()),null);
 assert.equal((await f.request(path,'POST',data,a.token)).status,200);
 const earlier={...data,latitude:0,observedAt:new Date(Date.now()-60000).toISOString()};
 assert.equal((await f.request(path,'POST',earlier,a.token)).status,200);
 let result=await f.request(path,'GET',undefined,a.token).then(r=>r.json());assert.equal(result.latitude,data.latitude);assert.equal(result.source,'phone_simulated');
 await f.request(`/api/profiles/${a.profile.id}/members`,'POST',{email:b.user.email,role:'viewer'},a.token);
 assert.equal((await f.request(path,'GET',undefined,b.token)).status,200);
 assert.equal((await f.request(path,'POST',data,b.token)).status,403);
 const pair=await f.request(`/api/devices/${id}/pairing`,'POST',{},a.token).then(r=>r.json());
 const watch=await f.request('/api/pairings/redeem','POST',{code:pair.code}).then(r=>r.json());
 assert.equal((await f.request(path,'POST',data,watch.token)).status,403);
 }finally{await f.cleanup();}
});
