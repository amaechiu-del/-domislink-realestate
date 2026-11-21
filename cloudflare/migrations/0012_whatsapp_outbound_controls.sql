-- Milestone 47F: explicit opt-in, service-window and controlled send reservations.
ALTER TABLE whatsapp_inbound ADD COLUMN provider_timestamp INTEGER;
CREATE TABLE IF NOT EXISTS whatsapp_contact_permissions (
 tenant_id TEXT NOT NULL,
 recipient_wa_id TEXT NOT NULL,
 outbound_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(outbound_opt_in IN (0,1)),
 voice_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(voice_opt_in IN (0,1)),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(tenant_id,recipient_wa_id)
);
CREATE TABLE IF NOT EXISTS whatsapp_send_requests (
 id TEXT PRIMARY KEY,
 draft_id TEXT NOT NULL UNIQUE REFERENCES whatsapp_reply_drafts(id),
 tenant_id TEXT NOT NULL,
 recipient_wa_id TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','sending','sent','failed','unknown')),
 provider_message_id TEXT UNIQUE,
 error_code TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wa_send_tenant ON whatsapp_send_requests(tenant_id,state,created_at);
