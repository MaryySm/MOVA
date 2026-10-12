import pg from 'pg';
import { randomUUID } from 'node:crypto';
export const base=process.env.MOVA_TEST_API_URL||'http://localhost:3000';
export async function fixture(){
 const pool=new pg.Pool({connectionString:process.env.DATABASE_URL||'postgres://mova:mova_dev_password@localhost:5432/mova'});
 const users=[]; const devices=[];
 async function request(path,method='GET',body,token){return fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});}
 async function account(){const response=await request('/api/auth/register','POST',{email:`test-${randomUUID()}@mova.local`,name:'Prueba',profileName:'Perfil prueba',password:'MovaTest2026!'}); if(response.status!==201)throw new Error(await response.text());const data=await response.json();users.push(data.user.id);return data;}
 async function device(account){const id=`test-${randomUUID()}`;const response=await request('/api/devices','POST',{id,name:'Reloj prueba',profileId:account.profile.id},account.token);if(response.status!==201)throw new Error(await response.text());devices.push(id);return id;}
 async function cleanup(){
  for(const id of devices){await pool.query('DELETE FROM emotion_entry_tags WHERE entry_id IN(SELECT id FROM emotion_entries WHERE device_id=$1)',[id]);await pool.query('DELETE FROM emotion_entries WHERE device_id=$1',[id]);await pool.query('DELETE FROM wearable_syncs WHERE device_id=$1',[id]);await pool.query('DELETE FROM wearable_states WHERE device_id=$1',[id]);}
  for(const id of users){
   await pool.query('DELETE FROM notification_reads WHERE notification_id IN(SELECT n.id FROM notifications n JOIN profiles p ON p.id=n.profile_id WHERE p.owner_id=$1) OR user_id=$1',[id]);
   for(const table of ['notifications','sos_events','calendar_events','emotion_entries','task_completions','tasks','profile_settings']){
    const column=table==='task_completions'?'task_id IN(SELECT t.id FROM tasks t JOIN profiles p ON p.id=t.profile_id WHERE p.owner_id=$1)':'profile_id IN(SELECT id FROM profiles WHERE owner_id=$1)';
    if(table==='emotion_entries')await pool.query('DELETE FROM emotion_entry_tags WHERE entry_id IN(SELECT e.id FROM emotion_entries e JOIN profiles p ON p.id=e.profile_id WHERE p.owner_id=$1)',[id]);
    await pool.query(`DELETE FROM ${table} WHERE ${column}`,[id]);
   }
   await pool.query('DELETE FROM telemetry_samples WHERE device_id IN(SELECT id FROM devices WHERE owner_id=$1)',[id]);
   await pool.query('DELETE FROM device_pairings WHERE device_id IN(SELECT id FROM devices WHERE owner_id=$1)',[id]);
   await pool.query('DELETE FROM audit_logs WHERE actor_user_id=$1 OR actor_device_id IN(SELECT id FROM devices WHERE owner_id=$1)',[id]);
   await pool.query('DELETE FROM devices WHERE owner_id=$1',[id]);await pool.query('DELETE FROM profile_members WHERE user_id=$1 OR profile_id IN(SELECT id FROM profiles WHERE owner_id=$1)',[id]);
   await pool.query('DELETE FROM profiles WHERE owner_id=$1',[id]);await pool.query('DELETE FROM user_settings WHERE user_id=$1',[id]);await pool.query('DELETE FROM users WHERE id=$1',[id]);
  }await pool.end();
 }
 return {pool,request,account,device,cleanup,users,devices};
}
