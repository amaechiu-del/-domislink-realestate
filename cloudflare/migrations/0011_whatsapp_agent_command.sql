-- Milestone 47E: OneLink reviewer grants and immutable review events.
CREATE TABLE IF NOT EXISTS whatsapp_agent_memberships (
 tenant_id TEXT NOT NULL,
 identity_subject TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('viewer','agent','reviewer','admin')),
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(tenant_id,identity_subject)
);
CREATE INDEX IF NOT EXISTS idx_wa_agent_subject ON whatsapp_agent_memberships(identity_subject,active);
CREATE TABLE IF NOT EXISTS whatsapp_review_audit (
 id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL,
 draft_id TEXT NOT NULL REFERENCES whatsapp_reply_drafts(id),
 actor_subject TEXT NOT NULL,
 action TEXT NOT NULL CHECK(action IN ('created','approved','rejected')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wa_review_audit ON whatsapp_review_audit(tenant_id,created_at);
