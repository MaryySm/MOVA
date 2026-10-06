export const emotionColumns = `id::text, mood, recorded_at AS "recordedAt", followup_due_at AS "dueAt",
  asked_at AS "askedAt", answered_at AS "answeredAt", still_feeling AS "stillFeeling", superseded_at AS "supersededAt"`;
const timezone = process.env.MOVA_TIMEZONE || 'America/Santiago';
export const followupSeconds = Number(process.env.MOVA_EMOTION_FOLLOWUP_SECONDS || 30);
if (!Number.isFinite(followupSeconds) || followupSeconds < 1) throw new Error('MOVA_EMOTION_FOLLOWUP_SECONDS debe ser positivo');

export async function recordEmotion(client, deviceId, mood, syncId) {
  await client.query(`UPDATE emotion_entries SET superseded_at=clock_timestamp()
    WHERE device_id=$1 AND followup_due_at IS NOT NULL AND answered_at IS NULL AND superseded_at IS NULL`, [deviceId]);
  await client.query(`INSERT INTO emotion_entries(device_id,mood,followup_due_at,sync_id)
    VALUES($1,$2,clock_timestamp()+($3 * interval '1 second'),$4)`, [deviceId, mood, followupSeconds, syncId]);
}
export async function enrichState(client, state) {
  const result = await client.query(`SELECT ${emotionColumns} FROM emotion_entries
    WHERE device_id=$1 AND followup_due_at IS NOT NULL AND answered_at IS NULL AND superseded_at IS NULL
    ORDER BY emotion_entries.id DESC LIMIT 1`, [state.deviceId]);
  return { ...state, followUp: result.rows[0] || null, serverNow: new Date().toISOString() };
}
export function installEmotionRoutes(app, pool, validDevice, readState) {
  app.get('/api/devices/:deviceId/emotions', async (req, res) => {
    if (!validDevice(req.params.deviceId)) return res.status(400).json({ error: 'Dispositivo inválido' });
    const { deviceId } = req.params;
    const before = req.query.before;
    if (before !== undefined && (typeof before !== 'string' || !/^\d{1,18}$/.test(before))) return res.status(400).json({ error: 'Cursor inválido' });
    try {
      const history = await pool.query(`SELECT ${emotionColumns} FROM emotion_entries
        WHERE device_id=$1 AND ($2::bigint IS NULL OR (recorded_at, emotion_entries.id) <
          (SELECT recorded_at,id FROM emotion_entries WHERE id=$2::bigint AND device_id=$1))
        ORDER BY recorded_at DESC, emotion_entries.id DESC LIMIT 51`, [deviceId, before || null]);
      const totals = await pool.query(`WITH periods AS (
        SELECT period, date_trunc(period, now() AT TIME ZONE $2) AS local_start,
          CASE period WHEN 'day' THEN interval '1 day' WHEN 'week' THEN interval '1 week' ELSE interval '1 month' END AS duration
        FROM unnest(ARRAY['day','week','month']) AS period
      ) SELECT p.period, p.local_start AT TIME ZONE $2 AS "startsAt",
          (p.local_start+p.duration) AT TIME ZONE $2 AS "endsAt",
          e.mood, COUNT(e.id)::int AS count
        FROM periods p LEFT JOIN emotion_entries e ON e.device_id=$1
          AND e.recorded_at >= p.local_start AT TIME ZONE $2
          AND e.recorded_at < (p.local_start+p.duration) AT TIME ZONE $2
        GROUP BY p.period,p.local_start,p.duration,e.mood`, [deviceId, timezone]);
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
  });

  // Idempotent prompt and answer operations: a retry cannot create a second follow-up.
  for (const action of ['prompt', 'answer']) {
    app.post(`/api/devices/:deviceId/emotions/:entryId/${action}`, async (req, res) => {
      const { deviceId, entryId } = req.params;
      if (!validDevice(deviceId) || !/^\d{1,18}$/.test(entryId) ||
          (action === 'answer' && typeof req.body?.stillFeeling !== 'boolean'))
        return res.status(400).json({ error: 'Respuesta inválida' });
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
    });
  }
}
