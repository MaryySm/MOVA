CREATE TABLE IF NOT EXISTS wearable_syncs(id BIGSERIAL PRIMARY KEY,device_id TEXT,payload JSONB NOT NULL,synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS wearable_syncs_synced_at_idx ON wearable_syncs(synced_at DESC);
