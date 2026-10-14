import { procedure } from './procedures.mjs';
import { randomUUID } from 'node:crypto';
import { deviceAccess, profileAccess, transaction, wrap, fail } from './platform.mjs';
export const emotionColumns = `id::text, mood, recorded_at AS "recordedAt", followup_due_at AS "dueAt",
  asked_at AS "askedAt", answered_at AS "answeredAt", still_feeling AS "stillFeeling", superseded_at AS "supersededAt", note,
 ARRAY(SELECT t.label FROM emotion_entry_tags x JOIN emotion_tags t ON t.id=x.tag_id WHERE x.entry_id=emotion_entries.id) AS tags`;
const timezone = process.env.MOVA_TIMEZONE || 'America/Santiago';
export const followupSeconds = Number(process.env.MOVA_EMOTION_FOLLOWUP_SECONDS || 30);
if (!Number.isFinite(followupSeconds) || followupSeconds < 1) throw new Error('MOVA_EMOTION_FOLLOWUP_SECONDS debe ser positivo');

export async function recordEmotion(client,deviceId,mood,syncId,details={}) {
 return procedure(client,'sp_registrar_emocion',[details.userId||null,details.actorDeviceId||null,deviceId,details.profileId,JSON.stringify({...details,mood,syncId,followupSeconds})],true);
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
      return entry;
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
        await procedure(client,'sp_procesar_seguimiento',[req.principal.userId||null,req.principal.deviceId||null,deviceId,entryId,action,req.body.stillFeeling??null]);
        const state = await readState(client, deviceId);
        await client.query('COMMIT');
        res.json(state);
      } catch (error) {
        if (client) await client.query('ROLLBACK'); console.error(error); res.status(error.status||503).json({ error: error.status?error.message:'No se pudo guardar el seguimiento' });
      } finally { client?.release(); }
    }));
  }
}
