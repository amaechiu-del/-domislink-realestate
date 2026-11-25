-- Milestone 47C: durable, lease-based processing queue and supervised reply drafts.
CREATE TABLE IF NOT EXISTS whatsapp_voice_jobs (
 inbound_id TEXT PRIMARY KEY REFERENCES whatsapp_inbound(id),
 tenant_id TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','leased','done','dead')),
 attempts INTEGER NOT NULL DEFAULT 0,
 available_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 leased_until TEXT,
 last_error TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wa_voice_jobs_ready ON whatsapp_voice_jobs(state,available_at);
CREATE TABLE IF NOT EXISTS whatsapp_reply_drafts (
 id TEXT PRIMARY KEY,
 inbound_id TEXT NOT NULL UNIQUE REFERENCES whatsapp_inbound(id),
 tenant_id TEXT NOT NULL,
 recipient_wa_id TEXT NOT NULL,
 body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 4096),
 state TEXT NOT NULL DEFAULT 'pending_review' CHECK(state IN ('pending_review','approved','rejected')),
 reviewer_subject TEXT,
 reviewed_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wa_reply_review ON whatsapp_reply_drafts(tenant_id,state,created_at);
