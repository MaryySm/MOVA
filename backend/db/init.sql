CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adult_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  age SMALLINT NOT NULL CHECK (age BETWEEN 1 AND 120),
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  diagnosis TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wearable_syncs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT,
  payload JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE wearable_syncs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS wearable_syncs_synced_at_idx ON wearable_syncs(synced_at DESC);
