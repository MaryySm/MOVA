import { procedure } from './procedures.mjs';
import { randomInt, randomUUID, randomBytes, scrypt as rawScrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(rawScrypt);
export const hashToken = value => createHash('sha256').update(value).digest('hex');
export const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
export function fail(status,message) { const error = new Error(message); error.status=status; throw error; }
export const text = (value,name,max=120) => {
 if(typeof value!=='string'||!value.trim()||value.length>max) fail(400,`${name} inválido`); return value.trim();
};
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const uuid = value => { if(!uuidPattern.test(value||'')) fail(400,'Identificador inválido'); return value; };
export const transaction = async (pool,fn) => {
 const db=await pool.connect(); try {await db.query('BEGIN'); const result=await fn(db); await db.query('COMMIT'); return result;}
 catch(error){await db.query('ROLLBACK'); throw error;}finally{db.release();}
};
export function requireUser(req) { if(!req.principal?.userId) fail(403,'Esta acción requiere una cuenta de usuario'); return req.principal.userId; }
export async function profileAccess(db,req,id,write=false,owner=false) {
 uuid(id); const userId=requireUser(req);
 const result=await db.query('SELECT p.*,m.role FROM profiles p JOIN profile_members m ON m.profile_id=p.id WHERE p.id=$1 AND m.user_id=$2 AND p.archived_at IS NULL',[id,userId]);
 const row=result.rows[0]; if(!row) fail(404,'Perfil no disponible');
 if((write&&row.role==='viewer')||(owner&&row.role!=='owner')) fail(403,'No tienes permiso para esta acción'); return row;
}
export async function deviceAccess(db,req,id,write=false) {
 const result=await db.query('SELECT * FROM devices WHERE id=$1 AND archived_at IS NULL',[id]); const device=result.rows[0];
 if(!device) fail(404,'Dispositivo no disponible');
 if(req.principal?.deviceId) {if(req.principal.deviceId!==id) fail(403,'Dispositivo no autorizado'); return device;}
 if(!device.profile_id) {if(device.owner_id!==requireUser(req)) fail(404,'Dispositivo no disponible');}
 else await profileAccess(db,req,device.profile_id,write);
 return device;
}
async function passwordHash(password) {
 if(typeof password!=='string'||password.length<10||password.length>128) fail(400,'La contraseña debe tener entre 10 y 128 caracteres');
 const salt=randomBytes(16).toString('hex'); const key=await scrypt(password,salt,64); return `${salt}:${key.toString('hex')}`;
}
async function passwordMatches(password,stored) {
 if(typeof password!=='string'||password.length>128) return false;
 const [salt,hex]=stored.split(':'); const actual=await scrypt(password,salt,64); const expected=Buffer.from(hex,'hex');
 return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
async function session(db,user) {
 const token=`usr_${randomBytes(32).toString('hex')}`;
 await procedure(db,'sp_administrar_cuenta',[user.id,'session',JSON.stringify({tokenHash:hashToken(token)})],true);
 return {token,user:{id:user.id,name:user.name,email:user.email,phone:user.phone}};
}
const initialTasks=[['Levantarme','⏰','06:30'],['Bañarme','🚿','06:45'],['Lavarme los dientes','🦷','07:00'],['Desayunar','🍳','07:15'],['Ir al colegio','🏫','08:00'],['Fútbol','⚽','16:00'],['Dormir','🌙','21:00']];
async function newProfile(db,userId,body) {
 return procedure(db,'sp_crear_perfil',[userId,JSON.stringify(body)],true);
}
function authLimiter(max=20) {
 const attempts=new Map(); return (req,res,next)=>{
  const now=Date.now(); const key=req.ip; const entry=attempts.get(key);
  if(attempts.size>10000) for(const [ip,item] of attempts) if(item.until<now) attempts.delete(ip);
  const item=entry&&entry.until>now?entry:{count:0,until:now+60000}; item.count++; attempts.set(key,item);
  if(item.count>max) {res.setHeader('Retry-After','60');return res.status(429).json({error:'Demasiados intentos. Espera un minuto.'});} next();
 };
}
export function installAuth(app,pool) {
 const limit=authLimiter();
 app.post('/api/auth/register',limit,wrap(async(req,res)=>{
  const email=text(req.body.email,'Correo',254).toLowerCase(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400,'Correo inválido');
  const name=text(req.body.name,'Nombre'); const password=await passwordHash(req.body.password); const phone=typeof req.body.phone==='string'?req.body.phone.slice(0,30):'';
  const token=`usr_${randomBytes(32).toString('hex')}`;
  const result={token,...await procedure(pool,'sp_registrar_usuario',[JSON.stringify({...req.body,email,name,phone,passwordHash:password,tokenHash:hashToken(token)})],true)}; res.status(201).json(result);
 }));
 app.post('/api/auth/login',limit,wrap(async(req,res)=>{
  const email=text(req.body.email,'Correo',254).toLowerCase(); const user=(await pool.query('SELECT * FROM users WHERE email=$1',[email])).rows[0];
  // Perform scrypt even for an unknown email to avoid fast account-enumeration responses.
  const matches=await passwordMatches(req.body.password,user?.password_hash||`${'0'.repeat(32)}:${'0'.repeat(128)}`);
  if(!user||!matches) fail(401,'Correo o contraseña incorrectos'); res.json(await session(pool,user));
 }));
 app.post('/api/pairings/redeem',limit,wrap(async(req,res)=>{
  const code=text(req.body.code,'Código',32).toUpperCase(); const token=`dev_${randomBytes(32).toString('hex')}`;
  res.json({token,device:await procedure(pool,'sp_canjear_codigo_legacy',[hashToken(code),hashToken(token)],true)});
 }));
 installPairingRequests(app,pool,limit);
 app.use('/api',wrap(async(req,res,next)=>{
  const token=(req.headers.authorization||'').replace(/^Bearer /,'');
  if(token.startsWith('usr_')) {
   const row=(await pool.query('SELECT user_id FROM auth_sessions WHERE token_hash=$1 AND expires_at>now() AND revoked_at IS NULL',[hashToken(token)])).rows[0];
   if(row)req.principal={userId:row.user_id,tokenHash:hashToken(token)};
  } else if(token.startsWith('dev_')) {
   const row=(await pool.query('SELECT id FROM devices WHERE credential_hash=$1 AND archived_at IS NULL',[hashToken(token)])).rows[0];
   if(row)req.principal={deviceId:row.id};
  }
  if(!req.principal) fail(401,'Inicia sesión o vincula el dispositivo'); next();
 }));
 app.get('/api/auth/me',wrap(async(req,res)=>{const id=requireUser(req);res.json((await pool.query('SELECT id,name,email,phone FROM users WHERE id=$1',[id])).rows[0]);}));
 app.post('/api/auth/logout',wrap(async(req,res)=>{requireUser(req);await procedure(pool,'sp_administrar_cuenta',[req.principal.userId,'logout',JSON.stringify({tokenHash:req.principal.tokenHash})],true);res.sendStatus(204);}));
 app.post('/api/auth/password',wrap(async(req,res)=>{
  const id=requireUser(req); const user=(await pool.query('SELECT * FROM users WHERE id=$1',[id])).rows[0];
  if(!await passwordMatches(req.body.currentPassword,user.password_hash)) fail(401,'Contraseña actual incorrecta');
  const hash=await passwordHash(req.body.newPassword);
  await procedure(pool,'sp_administrar_cuenta',[id,'password',JSON.stringify({passwordHash:hash,tokenHash:req.principal.tokenHash})],true);res.sendStatus(204);
 }));
}
export async function tasksFor(db,profileId,date) {
 return (await db.query(`SELECT t.*, COALESCE(c.done,false) AS done FROM tasks t
 LEFT JOIN task_completions c ON c.task_id=t.id AND c.occurrence_date=$2::date
 WHERE t.profile_id=$1 AND t.archived_at IS NULL AND extract(isodow FROM $2::date)::int=ANY(t.weekdays)
 ORDER BY t.scheduled_time,t.created_at`,[profileId,date])).rows;
}
export async function today(db,profileId) {
 return (await db.query("SELECT to_char(now() AT TIME ZONE timezone,'YYYY-MM-DD') AS date FROM profiles WHERE id=$1",[profileId])).rows[0]?.date;
}
export async function completeTask(db,req,taskId,date,done,profileId) {
 if(typeof done!=='boolean') fail(400,'Estado de tarea inválido');
 await procedure(db,'sp_completar_tarea',[req.principal.userId||null,req.principal.deviceId||null,profileId,uuid(taskId),date,done]);
}
export function installPlatform(app,pool) {
 app._movaClaimPairing();
 app.get('/api/devices/:deviceId/location',wrap(async(req,res)=>{
  await deviceAccess(pool,req,req.params.deviceId);
  const result=await pool.query('SELECT latitude,longitude,accuracy,source,observed_at AS "observedAt" FROM device_locations WHERE device_id=$1',[req.params.deviceId]);
  res.setHeader('Cache-Control','no-store');res.json(result.rows[0]||null);
 }));
 app.post('/api/devices/:deviceId/location',wrap(async(req,res)=>{
  const user=requireUser(req);
  res.json(await procedure(pool,'sp_registrar_ubicacion',[user,req.params.deviceId,JSON.stringify(req.body)],true));
 }));
 app.get('/api/catalog',wrap(async(req,res)=>{res.json({emotions:(await pool.query('SELECT * FROM emotion_types ORDER BY code')).rows,tags:(await pool.query('SELECT * FROM emotion_tags')).rows});}));
 app.get('/api/profiles',wrap(async(req,res)=>{const user=requireUser(req);res.json((await pool.query('SELECT p.*,m.role FROM profiles p JOIN profile_members m ON m.profile_id=p.id WHERE m.user_id=$1 AND p.archived_at IS NULL ORDER BY p.created_at',[user])).rows);}));
 app.post('/api/profiles',wrap(async(req,res)=>{const user=requireUser(req);res.status(201).json(await newProfile(pool,user,req.body));}));
 app.patch('/api/profiles/:profileId',wrap(async(req,res)=>{
  const profile=await profileAccess(pool,req,req.params.profileId,true); const b=req.body;
  const name=b.name===undefined?profile.name:text(b.name,'Nombre'); const age=b.age===undefined?profile.age:b.age===null?null:Number(b.age);
  if(age!==null&&(!Number.isInteger(age)||age<0||age>120))fail(400,'Edad inválida');
  const diagnosis=b.diagnosis===undefined?profile.diagnosis:String(b.diagnosis).slice(0,1000);
  const photo=b.photo===undefined?profile.photo:String(b.photo); if(photo.length>500000)fail(400,'Foto demasiado grande');
  res.json(await procedure(pool,'sp_administrar_perfil',[req.principal.userId,profile.id,'edit',JSON.stringify({name,age,diagnosis,photo})],true));
 }));
 app.delete('/api/profiles/:profileId',wrap(async(req,res)=>{
  const p=await profileAccess(pool,req,req.params.profileId,true,true);
  await procedure(pool,'sp_administrar_perfil',[req.principal.userId,p.id,'archive','{}'],true);res.sendStatus(204);
 }));
 app.get('/api/profiles/:profileId/members',wrap(async(req,res)=>{const p=await profileAccess(pool,req,req.params.profileId);res.json((await pool.query('SELECT u.id,u.email,u.name,m.role FROM profile_members m JOIN users u ON u.id=m.user_id WHERE m.profile_id=$1',[p.id])).rows);}));
 app.post('/api/profiles/:profileId/members',wrap(async(req,res)=>{
  const p=await profileAccess(pool,req,req.params.profileId,true,true); const role=req.body.role;
  if(!['caregiver','viewer'].includes(role))fail(400,'Rol inválido');
  const user=(await pool.query('SELECT id FROM users WHERE email=$1',[text(req.body.email,'Correo',254).toLowerCase()])).rows[0];
  if(!user)fail(404,'Esa persona debe registrar una cuenta primero');if(user.id===p.owner_id)fail(400,'No se puede cambiar al propietario');
  await procedure(pool,'sp_administrar_perfil',[req.principal.userId,p.id,'member.save',JSON.stringify({email:req.body.email,role})],true);res.sendStatus(204);
 }));
 app.delete('/api/profiles/:profileId/members/:userId',wrap(async(req,res)=>{const p=await profileAccess(pool,req,req.params.profileId,true,true);if(p.owner_id===uuid(req.params.userId))fail(400,'No se puede quitar al propietario');await procedure(pool,'sp_administrar_perfil',[req.principal.userId,p.id,'member.remove',JSON.stringify({userId:req.params.userId})],true);res.sendStatus(204);}));
 app.get('/api/devices',wrap(async(req,res)=>{const id=requireUser(req);res.json((await pool.query('SELECT DISTINCT d.* FROM devices d LEFT JOIN profile_members m ON m.profile_id=d.profile_id WHERE (d.owner_id=$1 OR m.user_id=$1) AND d.archived_at IS NULL ORDER BY d.created_at',[id])).rows.map(({credential_hash,...d})=>d));}));
 app.post('/api/devices',wrap(async(req,res)=>{
  const user=requireUser(req);const profile=await profileAccess(pool,req,req.body.profileId,true,true);const id=text(req.body.id,'Identificador',80);
  if(!/^[A-Za-z0-9_-]+$/.test(id))fail(400,'Identificador de dispositivo inválido');
  const result=await procedure(pool,'sp_registrar_dispositivo',[user,profile.id,id,text(req.body.name||'MOVA Kids','Nombre')],true);res.status(201).json(result);
 }));
 app.post('/api/devices/:deviceId/pairing',wrap(async(req,res)=>{
  const device=await deviceAccess(pool,req,req.params.deviceId,true);if(device.owner_id!==requireUser(req))fail(403,'Solo el propietario puede vincular el reloj');
  const code=randomBytes(6).toString('hex').toUpperCase();
  await procedure(pool,'sp_generar_codigo_legacy',[req.principal.userId,device.id,hashToken(code)]);res.json({code,expiresIn:600});
 }));
 app.delete('/api/devices/:deviceId',wrap(async(req,res)=>{
  const device=await deviceAccess(pool,req,req.params.deviceId,true);if(device.owner_id!==requireUser(req))fail(403,'Solo el propietario puede desvincular');
  await procedure(pool,'sp_archivar_dispositivo',[req.principal.userId,device.id]);res.sendStatus(204);
 }));
 app.get('/api/profiles/:profileId/tasks',wrap(async(req,res)=>{const p=await profileAccess(pool,req,req.params.profileId);const date=req.query.date||await today(pool,p.id);if(!/^\d{4}-\d{2}-\d{2}$/.test(date))fail(400,'Fecha inválida');res.json({date,tasks:await tasksFor(pool,p.id,date)});}));
 app.post('/api/profiles/:profileId/tasks',wrap(async(req,res)=>{const p=await profileAccess(pool,req,req.params.profileId,true);res.status(201).json(await taskWrite(pool,p.id,req.body,{},req.principal.userId));}));
 app.patch('/api/tasks/:taskId',wrap(async(req,res)=>{const task=(await pool.query('SELECT * FROM tasks WHERE id=$1 AND archived_at IS NULL',[uuid(req.params.taskId)])).rows[0];if(!task)fail(404,'Tarea no disponible');await profileAccess(pool,req,task.profile_id,true);res.json(await taskWrite(pool,task.profile_id,req.body,task,req.principal.userId));}));
 app.delete('/api/tasks/:taskId',wrap(async(req,res)=>{const task=(await pool.query('SELECT * FROM tasks WHERE id=$1',[uuid(req.params.taskId)])).rows[0];if(!task)fail(404,'Tarea no disponible');await profileAccess(pool,req,task.profile_id,true);await procedure(pool,'sp_archivar_recurso',[req.principal.userId,'task',task.id]);res.sendStatus(204);}));
 app.put('/api/tasks/:taskId/completion',wrap(async(req,res)=>{
  const task=(await pool.query('SELECT * FROM tasks WHERE id=$1',[uuid(req.params.taskId)])).rows[0];if(!task)fail(404,'Tarea no disponible');
  await profileAccess(pool,req,task.profile_id,true);const date=req.body.date||await today(pool,task.profile_id);if(!/^\d{4}-\d{2}-\d{2}$/.test(date))fail(400,'Fecha inválida');
  await completeTask(pool,req,task.id,date,req.body.done,task.profile_id);res.sendStatus(204);
 }));
 app.get('/api/profiles/:profileId/calendar',wrap(async(req,res)=>{const p=await profileAccess(pool,req,req.params.profileId);res.json((await pool.query('SELECT * FROM calendar_events WHERE profile_id=$1 AND archived_at IS NULL ORDER BY starts_at LIMIT 500',[p.id])).rows);}));
 app.post('/api/profiles/:profileId/calendar',wrap(async(req,res)=>{const p=await profileAccess(pool,req,req.params.profileId,true);res.status(201).json(await calendarWrite(pool,p.id,req.body,{},req.principal.userId));}));
 app.patch('/api/calendar/:eventId',wrap(async(req,res)=>{const event=(await pool.query('SELECT * FROM calendar_events WHERE id=$1 AND archived_at IS NULL',[uuid(req.params.eventId)])).rows[0];if(!event)fail(404,'Evento no disponible');await profileAccess(pool,req,event.profile_id,true);res.json(await calendarWrite(pool,event.profile_id,req.body,event,req.principal.userId));}));
 app.delete('/api/calendar/:eventId',wrap(async(req,res)=>{const event=(await pool.query('SELECT * FROM calendar_events WHERE id=$1',[uuid(req.params.eventId)])).rows[0];if(!event)fail(404,'Evento no disponible');await profileAccess(pool,req,event.profile_id,true);await procedure(pool,'sp_archivar_recurso',[req.principal.userId,'calendar',event.id]);res.sendStatus(204);}));
 app.get('/api/profiles/:profileId/settings',wrap(async(req,res)=>{const p=await profileAccess(pool,req,req.params.profileId);res.json((await pool.query('SELECT * FROM profile_settings WHERE profile_id=$1',[p.id])).rows[0]);}));
 app.patch('/api/profiles/:profileId/settings',wrap(async(req,res)=>{const p=await profileAccess(pool,req,req.params.profileId,true);const old=(await pool.query('SELECT * FROM profile_settings WHERE profile_id=$1',[p.id])).rows[0];const b={...old,...req.body};if(['vibration','sound','lights'].some(k=>typeof b[k]!=='boolean')||!Number.isInteger(b.intensity)||b.intensity<0||b.intensity>10)fail(400,'Preferencias inválidas');res.json(await procedure(pool,'sp_administrar_perfil',[req.principal.userId,p.id,'settings',JSON.stringify(b)],true));}));
 app.get('/api/settings',wrap(async(req,res)=>{res.json((await pool.query('SELECT * FROM user_settings WHERE user_id=$1',[requireUser(req)])).rows[0]);}));
 app.patch('/api/settings',wrap(async(req,res)=>{const user=requireUser(req);const lang=text(req.body.language,'Idioma',40);res.json(await procedure(pool,'sp_administrar_cuenta',[user,'settings',JSON.stringify({language:lang})],true));}));
 app.get('/api/profiles/:profileId/notifications',wrap(async(req,res)=>{const p=await profileAccess(pool,req,req.params.profileId);res.json((await pool.query('SELECT n.*,r.read_at FROM notifications n LEFT JOIN notification_reads r ON r.notification_id=n.id AND r.user_id=$2 WHERE n.profile_id=$1 ORDER BY n.created_at DESC LIMIT 100',[p.id,req.principal.userId])).rows);}));
 app.post('/api/notifications/:notificationId/read',wrap(async(req,res)=>{const n=(await pool.query('SELECT * FROM notifications WHERE id=$1',[uuid(req.params.notificationId)])).rows[0];if(!n)fail(404,'Aviso no disponible');await profileAccess(pool,req,n.profile_id);await procedure(pool,'sp_leer_aviso',[req.principal.userId,n.id]);res.sendStatus(204);}));
 app.get('/api/devices/:deviceId/telemetry',wrap(async(req,res)=>{await deviceAccess(pool,req,req.params.deviceId);res.json((await pool.query('SELECT * FROM telemetry_samples WHERE device_id=$1 ORDER BY recorded_at DESC LIMIT 100',[req.params.deviceId])).rows.map(row=>({...row,heart_rate:row.heart_rate===null?null:Number(row.heart_rate)}))); }));
 app.get('/api/profiles/:profileId/sos',wrap(async(req,res)=>{await profileAccess(pool,req,req.params.profileId);res.json((await pool.query('SELECT * FROM sos_events WHERE profile_id=$1 ORDER BY raised_at DESC LIMIT 100',[req.params.profileId])).rows);}));
}
async function taskWrite(db,profileId,body,old={},userId) {
 const id=old.id||randomUUID();const title=text(body.title??old.title,'Título');const icon=text(body.icon??old.icon??'📋','Icono',16);
 const time=body.time??old.scheduled_time; if(typeof time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time))fail(400,'Hora inválida');
 const days=body.weekdays??old.weekdays??[1,2,3,4,5,6,7];if(!Array.isArray(days)||!days.length||days.some(d=>!Number.isInteger(d)||d<1||d>7))fail(400,'Días inválidos');
 return procedure(db,'sp_guardar_tarea',[userId,profileId,id,JSON.stringify({title,icon,time,weekdays:[...new Set(days)]})],true);
}
async function calendarWrite(db,profileId,body,old={},userId) {
 const id=old.id||randomUUID();const title=text(body.title??old.title,'Título');const start=body.startsAt??old.starts_at;const end=body.endsAt??old.ends_at;
 if(!Number.isFinite(Date.parse(start))||!Number.isFinite(Date.parse(end))||Date.parse(end)<=Date.parse(start))fail(400,'Fechas inválidas');
 const notes=body.notes??old.notes??'';if(typeof notes!=='string'||notes.length>2000)fail(400,'Nota inválida');
 return procedure(db,'sp_guardar_evento',[userId,profileId,id,JSON.stringify({title,startsAt:start,endsAt:end,notes})],true);
}

function installPairingRequests(app,pool,limit) {
 app.post('/api/pairings/start',limit,wrap(async(req,res)=>{
  const secret=randomBytes(32).toString('hex'); const token=`dev_${hashToken(`watch:${secret}`)}`;
  let result,code;
  for(let attempt=0;attempt<10;attempt++) {
   code=String(randomInt(1000000)).padStart(6,'0');
   try { result=await procedure(pool,'sp_iniciar_vinculacion',[randomUUID(),hashToken(code),hashToken(secret),hashToken(token)],true); break; }
   catch(error) {if(error.code!=='23505')throw error;}
  }
  if(!result)fail(503,'No se pudo generar un código');
  res.status(201).json({...result,code,secret,qr:`mova://pair?code=${code}`});
 }));
 app.post('/api/pairings/status',authLimiter(240),wrap(async(req,res)=>{
  const secret=text(req.body.secret,'Credencial de vinculación',64);
  if(!/^[a-f0-9]{64}$/.test(secret))fail(400,'Credencial inválida');
  const result=await procedure(pool,'sp_consultar_vinculacion',[hashToken(secret)],true);
  res.setHeader('Cache-Control','no-store');
  res.json({...result,...(result.status==='paired'?{token:`dev_${hashToken(`watch:${secret}`)}`}:{})});
 }));
 // Register after the auth middleware so a watch code never grants owner permissions.
 app._movaClaimPairing=()=>app.post('/api/pairings/claim',limit,wrap(async(req,res)=>{
  const user=requireUser(req); const code=text(req.body.code,'Código',6);
  if(!/^\d{6}$/.test(code))fail(400,'Ingresa los seis dígitos del reloj');
  res.json({device:await procedure(pool,'sp_completar_vinculacion',[user,uuid(req.body.profileId),hashToken(code),text(req.body.name||'MOVA Kids','Nombre')],true)});
 }));
}
