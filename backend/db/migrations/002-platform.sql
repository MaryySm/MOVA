CREATE TABLE users (
 id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE CHECK(email=lower(email)), name TEXT NOT NULL,
 password_hash TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE auth_sessions (
 token_hash TEXT PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), revoked_at TIMESTAMPTZ
);
CREATE TABLE profiles (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES users(id), name TEXT NOT NULL,
 age INT CHECK(age BETWEEN 0 AND 120), diagnosis TEXT NOT NULL DEFAULT '', photo TEXT NOT NULL DEFAULT '',
 timezone TEXT NOT NULL DEFAULT 'America/Santiago', archived_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE profile_members (
 profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK(role IN ('owner','caregiver','viewer')), PRIMARY KEY(profile_id,user_id)
);
CREATE TABLE devices (
 id TEXT PRIMARY KEY, owner_id UUID REFERENCES users(id), profile_id UUID REFERENCES profiles(id),
 name TEXT NOT NULL DEFAULT 'MOVA Kids', credential_hash TEXT UNIQUE,
 last_seen_at TIMESTAMPTZ, archived_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO devices(id) SELECT device_id FROM wearable_states UNION SELECT device_id FROM wearable_syncs WHERE device_id IS NOT NULL;
CREATE TABLE device_pairings (
 code_hash TEXT PRIMARY KEY, device_id TEXT NOT NULL REFERENCES devices(id), expires_at TIMESTAMPTZ NOT NULL,
 consumed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE tasks (
 id UUID PRIMARY KEY, profile_id UUID NOT NULL REFERENCES profiles(id), title TEXT NOT NULL,
 icon TEXT NOT NULL DEFAULT '📋', scheduled_time TIME NOT NULL, weekdays INT[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
 legacy_key TEXT, archived_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(profile_id,legacy_key)
);
CREATE TABLE task_completions (
 task_id UUID REFERENCES tasks(id), occurrence_date DATE NOT NULL, done BOOLEAN NOT NULL,
 actor_user_id UUID REFERENCES users(id), actor_device_id TEXT REFERENCES devices(id),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(task_id,occurrence_date)
);
CREATE TABLE calendar_events (
 id UUID PRIMARY KEY, profile_id UUID NOT NULL REFERENCES profiles(id), title TEXT NOT NULL,
 starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL, notes TEXT NOT NULL DEFAULT '',
 archived_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK(ends_at>starts_at)
);
CREATE TABLE emotion_types (code TEXT PRIMARY KEY, label TEXT NOT NULL UNIQUE, emoji TEXT NOT NULL, color TEXT NOT NULL);
INSERT INTO emotion_types VALUES
 ('great','¡Genial!','😄','#34D399'),('good','Bien','🙂','#60A5FA'),('neutral','Normal','😐','#A78BFA'),
 ('tired','Cansado','😴','#FBBF24'),('sad','Triste','😢','#FB7185'),('angry','Enojado','😡','#F97316'),('stressed','Estresado','😤','#F590B8');
CREATE TABLE emotion_tags (id TEXT PRIMARY KEY, label TEXT NOT NULL UNIQUE);
INSERT INTO emotion_tags VALUES ('motivated','Motivado'),('energetic','Energizado'),('calm','Tranquilo'),
 ('anxious','Ansioso'),('focused','Concentrado'),('sore','Dolorido'),('relaxed','Relajado'),('proud','Orgulloso');
ALTER TABLE emotion_entries ADD COLUMN profile_id UUID REFERENCES profiles(id), ADD COLUMN recorded_by UUID REFERENCES users(id),
 ADD COLUMN note TEXT NOT NULL DEFAULT '', ADD COLUMN mood_code TEXT REFERENCES emotion_types(code);
UPDATE emotion_entries e SET mood_code=t.code FROM emotion_types t WHERE t.label=e.mood;
CREATE TABLE emotion_entry_tags (
 entry_id BIGINT REFERENCES emotion_entries(id) ON DELETE CASCADE, tag_id TEXT REFERENCES emotion_tags(id), PRIMARY KEY(entry_id,tag_id)
);
CREATE TABLE sos_events (
 id UUID PRIMARY KEY, device_id TEXT NOT NULL REFERENCES devices(id), profile_id UUID REFERENCES profiles(id),
 raised_at TIMESTAMPTZ NOT NULL DEFAULT now(), acknowledged_at TIMESTAMPTZ, acknowledged_by UUID REFERENCES users(id)
);
CREATE UNIQUE INDEX sos_open_idx ON sos_events(device_id) WHERE acknowledged_at IS NULL;
CREATE TABLE notifications (
 id UUID PRIMARY KEY, profile_id UUID REFERENCES profiles(id), kind TEXT NOT NULL,
 title TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE notification_reads (
 notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id),
 read_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(notification_id,user_id)
);
CREATE TABLE profile_settings (
 profile_id UUID PRIMARY KEY REFERENCES profiles(id), vibration BOOLEAN NOT NULL DEFAULT true,
 sound BOOLEAN NOT NULL DEFAULT true, lights BOOLEAN NOT NULL DEFAULT true, intensity INT NOT NULL DEFAULT 6 CHECK(intensity BETWEEN 0 AND 10)
);
CREATE TABLE user_settings (
 user_id UUID PRIMARY KEY REFERENCES users(id), language TEXT NOT NULL DEFAULT 'Español', timezone TEXT NOT NULL DEFAULT 'America/Santiago'
);
CREATE TABLE telemetry_samples (
 id BIGSERIAL PRIMARY KEY, device_id TEXT NOT NULL REFERENCES devices(id), heart_rate NUMERIC CHECK(heart_rate BETWEEN 0 AND 300),
 steps INT CHECK(steps>=0), battery INT CHECK(battery BETWEEN 0 AND 100),
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE audit_logs (
 id BIGSERIAL PRIMARY KEY, actor_user_id UUID REFERENCES users(id), actor_device_id TEXT REFERENCES devices(id),
 action TEXT NOT NULL, resource_id TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tasks_profile_idx ON tasks(profile_id) WHERE archived_at IS NULL;
CREATE INDEX calendar_profile_idx ON calendar_events(profile_id, starts_at) WHERE archived_at IS NULL;
CREATE INDEX emotion_profile_idx ON emotion_entries(profile_id,recorded_at DESC,id DESC);
CREATE INDEX notifications_profile_idx ON notifications(profile_id,created_at DESC);
CREATE INDEX telemetry_device_idx ON telemetry_samples(device_id,recorded_at DESC);
ALTER TABLE emotion_entries ALTER COLUMN device_id DROP NOT NULL;
