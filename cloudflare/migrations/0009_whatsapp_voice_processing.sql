-- Milestone 47B: consent-gated voice processing and per-tenant configuration.
ALTER TABLE whatsapp_inbound ADD COLUMN transcription TEXT;
ALTER TABLE whatsapp_inbound ADD COLUMN translation TEXT;
ALTER TABLE whatsapp_inbound ADD COLUMN processed_at TEXT;
ALTER TABLE whatsapp_inbound ADD COLUMN processing_error TEXT;
CREATE TABLE IF NOT EXISTS whatsapp_voice_settings (
 tenant_id TEXT PRIMARY KEY,
 enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
 transcription_enabled INTEGER NOT NULL DEFAULT 0 CHECK(transcription_enabled IN (0,1)),
 translation_enabled INTEGER NOT NULL DEFAULT 0 CHECK(translation_enabled IN (0,1)),
 ai_reply_enabled INTEGER NOT NULL DEFAULT 0 CHECK(ai_reply_enabled IN (0,1)),
 target_language TEXT NOT NULL DEFAULT 'en',
 daily_audio_seconds_limit INTEGER NOT NULL DEFAULT 300 CHECK(daily_audio_seconds_limit BETWEEN 0 AND 86400),
 retention_days INTEGER NOT NULL DEFAULT 7 CHECK(retention_days BETWEEN 1 AND 90),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS whatsapp_voice_consents (
 tenant_id TEXT NOT NULL,
 sender_wa_id TEXT NOT NULL,
 voice_processing INTEGER NOT NULL DEFAULT 0 CHECK(voice_processing IN (0,1)),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(tenant_id,sender_wa_id)
);
CREATE TABLE IF NOT EXISTS whatsapp_voice_usage (
 id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL,
 inbound_id TEXT NOT NULL UNIQUE REFERENCES whatsapp_inbound(id),
 duration_seconds INTEGER NOT NULL CHECK(duration_seconds BETWEEN 0 AND 3600),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wa_voice_usage_tenant_date ON whatsapp_voice_usage(tenant_id,created_at);
