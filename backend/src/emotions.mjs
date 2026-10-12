import { randomUUID } from 'node:crypto';
import { deviceAccess, profileAccess, transaction, wrap, fail, audit } from './platform.mjs';
export const emotionColumns = `id::text, mood, recorded_at AS "recordedAt", followup_due_at AS "dueAt",
  asked_at AS "askedAt", answered_at AS "answeredAt", still_feeling AS "stillFeeling", superseded_at AS "supersededAt", note,
 ARRAY(SELECT t.label FROM emotion_entry_tags x JOIN emotion_tags t ON t.id=x.tag_id WHERE x.entry_id=emotion_entries.id) AS tags`;
const timezone = process.env.MOVA_TIMEZONE || 'America/Santiago';
export const followupSeconds = Number(process.env.MOVA_EMOTION_FOLLOWUP_SECONDS || 30);
if (!Number.isFinite(followupSeconds) || followupSeconds < 1) throw new Error('MOVA_EMOTION_FOLLOWUP_SECONDS debe ser positivo');

export async function recordEmotion(client,deviceId,mood,syncId,details={}) {
  const aliases={Genial:'¡Genial!',Regular:'Normal',Bajo:'Triste'};
  const type=(await client.query('SELECT * FROM emotion_types WHERE label=$1 OR code=$1',[aliases[mood]||mood])).rows[0];
  if(!type) fail(400,'Emoción no válida');
  const note=details.note??''; const tags=details.tags??[];
  if(typeof note!=='string'||note.length>2000||!Array.isArray(tags)||tags.length>12||tags.some(t=>typeof t!=='string'))fail(400,'Nota o etiquetas inválidas');
  const selected=(await client.query('SELECT id FROM emotion_tags WHERE id=ANY($1::text[]) OR label=ANY($1::text[])',[tags])).rows;
  if(selected.length!==new Set(tags).size)fail(400,'Etiqueta no válida');
  if(deviceId) await client.query(`UPDATE emotion_entries SET superseded_at=clock_timestamp()
    WHERE device_id=$1 AND followup_due_at IS NOT NULL AND answered_at IS NULL AND superseded_at IS NULL`,[deviceId]);
  const entry=(await client.query(`INSERT INTO emotion_entries(device_id,mood,mood_code,profile_id,recorded_by,note,followup_due_at,sync_id)
    VALUES($1,$2,$3,$4,$5,$6,CASE WHEN $1::text IS NULL THEN NULL ELSE clock_timestamp()+($7 * interval '1 second') END,$8) RETURNING id::text`,
    [deviceId,type.label,type.code,details.profileId,details.userId||null,note,followupSeconds,syncId])).rows[0];
  for(const tag of selected) await client.query('INSERT INTO emotion_entry_tags VALUES($1,$2)',[entry.id,tag.id]);
  if(deviceId) await client.query("UPDATE wearable_states SET payload=jsonb_set(payload,'{mood}',to_jsonb($2::text)) WHERE device_id=$1",[deviceId,type.label]);
  await client.query("INSERT INTO notifications(id,profile_id,kind,title,body) VALUES($1,$2,'emotion','Nueva emoción registrada',$3)",[randomUUID(),details.profileId,type.label]);
  return entry;
}
export async function enrichState(client, state) {
  const result = await client.query(`SELECT ${emotionColumns} FROM emotion_entries
    WHERE device_id=$1 AND followup_due_at IS NOT NULL AND answered_at IS NULL AND superseded_at IS NULL
    ORDER BY emotion_entries.id DESC LIMIT 1`, [state.deviceId]);
  return { ...state, followUp: result.rows[0] || null, serverNow: new Date().toISOString() };
}
export function installEmotionRoutes(app, pool, validDevice, readState) {
  app.post('/api/profiles/:profileId/emotions',wrap(async(req,res)=>{
    const profile=await profileAccess(pool,req,req.params.profileId,true);
    const result=await transaction(pool,async db=>{
      const entry=await recordEmotion(db,null,req.body.mood,null,{...req.body,profileId:profile.id,userId:req.principal.userId});
      await audit(db,req.principal,'emotion.register',entry.id);return entry;
    });res.status(201).json(result);
  }));
  app.get(['/api/devices/:deviceId/emotions','/api/profiles/:profileId/emotions'], wrap(async (req, res) => {
    let target,column;
    if(req.params.profileId) { await profileAccess(pool,req,req.params.profileId);target=req.params.profileId;column='profile_id'; }
    else { await deviceAccess(pool,req,req.params.deviceId);target=req.params.deviceId;column='device_id'; }
    const before = req.query.before;
    if (before !== undefined && (typeof before !== 'string' || !/^\d{1,18}$/.test(before))) return res.status(400).json({ error: 'Cursor inválido' });
    try {
      const history = await pool.query(`SELECT ${emotionColumns} FROM emotion_entries
        WHERE ${column}=$1 AND ($2::bigint IS NULL OR (recorded_at, emotion_entries.id) <
          (SELECT recorded_at,id FROM emotion_entries WHERE id=$2::bigint AND ${column}=$1))
        ORDER BY recorded_at DESC, emotion_entries.id DESC LIMIT 51`, [target, before || null]);
      const totals = await pool.query(`WITH periods AS (
        SELECT period, date_trunc(period, now() AT TIME ZONE $2) AS local_start,
          CASE period WHEN 'day' THEN interval '1 day' WHEN 'week' THEN interval '1 week' ELSE interval '1 month' END AS duration
        FROM unnest(ARRAY['day','week','month']) AS period
      ) SELECT p.period, p.local_start AT TIME ZONE $2 AS "startsAt",
          (p.local_start+p.duration) AT TIME ZONE $2 AS "endsAt",
          e.mood, COUNT(e.id)::int AS count
        FROM periods p LEFT JOIN emotion_entries e ON e.${column}=$1
          AND e.recorded_at >= p.local_start AT TIME ZONE $2
          AND e.recorded_at < (p.local_start+p.duration) AT TIME ZONE $2
        GROUP BY p.period,p.local_start,p.duration,e.mood`, [target, timezone]);
      const summary = {};
      for (const row of totals.rows) {
        summary[row.period] ??= { total: 0, startsAt: row.startsAt, endsAt: row.endsAt, emotions: [] };
        if (row.mood !== null) {
          summary[row.period].total += row.count;
          summary[row.period].emotions.push({ mood: row.mood, count: row.count });
        }
      }
      for (const period of Object.values(summary)) {
        period.emotions.sort((a, b) => b.count - a.count || a.mood.localeCompare(b.mood));
        for (const emotion of period.emotions) emotion.percentage = Number((emotion.count / period.total * 100).toFixed(1));
      }
      const formatter = new Intl.DateTimeFormat('es-CL', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
      const entries = history.rows.slice(0, 50).map(entry => ({ ...entry,
        recordedAtLocal: formatter.format(new Date(entry.recordedAt)),
        answeredAtLocal: entry.answeredAt ? formatter.format(new Date(entry.answeredAt)) : null,
      }));
      res.setHeader('Cache-Control', 'no-store');
      res.json({ entries, summary, timezone, nextCursor: history.rows.length > 50 ? entries.at(-1).id : null, followupSeconds });
    } catch (error) { console.error(error); res.status(503).json({ error: 'No se pudo leer el historial' }); }
  }));

  // Idempotent prompt and answer operations: a retry cannot create a second follow-up.
  for (const action of ['prompt', 'answer']) {
    app.post(`/api/devices/:deviceId/emotions/:entryId/${action}`, wrap(async (req, res) => {
      const { deviceId, entryId } = req.params;
      if (!validDevice(deviceId) || !/^\d{1,18}$/.test(entryId) ||
          (action === 'answer' && typeof req.body?.stillFeeling !== 'boolean'))
        return res.status(400).json({ error: 'Respuesta inválida' });
      await deviceAccess(pool,req,deviceId,true);
      let client;
      try {
        client = await pool.connect();
        await client.query('BEGIN');
        // Use the same lock order as registration to keep new moods from racing an old answer.
        await client.query('SELECT device_id FROM wearable_states WHERE device_id=$1 FOR UPDATE', [deviceId]);
        const event = await client.query('SELECT * FROM emotion_entries WHERE id=$1 AND device_id=$2 FOR UPDATE', [entryId, deviceId]);
        const entry = event.rows[0];
        if (!entry || entry.superseded_at || !entry.followup_due_at) {
          await client.query('ROLLBACK'); return res.status(409).json({ error: 'El seguimiento ya no está disponible' });
        }
        const due = await client.query('SELECT $1::timestamptz <= clock_timestamp() AS due', [entry.followup_due_at]);
        if (!due.rows[0].due) {
          await client.query('ROLLBACK'); return res.status(409).json({ error: 'Todavía no es hora del seguimiento' });
        }
        if (action === 'prompt' && !entry.answered_at) {
          await client.query('UPDATE emotion_entries SET asked_at=COALESCE(asked_at,clock_timestamp()) WHERE id=$1', [entryId]);
        }
        if (action === 'answer') {
          if (!entry.asked_at || (entry.answered_at && entry.still_feeling !== req.body.stillFeeling)) {
            await client.query('ROLLBACK'); return res.status(409).json({ error: 'El seguimiento no admite esa respuesta' });
          }
          await client.query(`UPDATE emotion_entries SET answered_at=COALESCE(answered_at,clock_timestamp()),
            still_feeling=$2 WHERE id=$1`, [entryId, req.body.stillFeeling]);
        }
        const state = await readState(client, deviceId);
        await client.query('COMMIT');
        res.json(state);
      } catch (error) {
        if (client) await client.query('ROLLBACK'); console.error(error); res.status(503).json({ error: 'No se pudo guardar el seguimiento' });
      } finally { client?.release(); }
    }));
  }
}
