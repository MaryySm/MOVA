CREATE TABLE IF NOT EXISTS wearable_syncs(id BIGSERIAL PRIMARY KEY,device_id TEXT,payload JSONB NOT NULL,synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS wearable_syncs_synced_at_idx ON wearable_syncs(synced_at DESC);

CREATE TABLE IF NOT EXISTS wearable_states (
  device_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS emotion_entries (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  mood TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  followup_due_at TIMESTAMPTZ,
  asked_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  still_feeling BOOLEAN,
  superseded_at TIMESTAMPTZ,
  sync_id BIGINT UNIQUE
);
CREATE INDEX IF NOT EXISTS emotion_entries_device_idx ON emotion_entries(device_id, id DESC);
-- Preserve emotional records created before this feature without scheduling old prompts.
INSERT INTO emotion_entries(device_id, mood, recorded_at, sync_id)
SELECT device_id, CASE payload->>'mood'
  WHEN 'Genial' THEN '¡Genial!' WHEN 'Regular' THEN 'Normal' WHEN 'Bajo' THEN 'Triste'
  ELSE payload->>'mood' END, synced_at, id
FROM wearable_syncs
WHERE device_id IS NOT NULL AND jsonb_typeof(payload->'mood') = 'string'
  AND length(trim(payload->>'mood')) BETWEEN 1 AND 80
ON CONFLICT (sync_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS emotion_entries_chronology_idx ON emotion_entries(device_id, recorded_at DESC, id DESC);
