-- Milestone 47: inbound WhatsApp event ledger, no unconsented outbound messages.
CREATE TABLE IF NOT EXISTS whatsapp_inbound (
 id TEXT PRIMARY KEY,
 provider_message_id TEXT NOT NULL UNIQUE,
 business_phone_id TEXT NOT NULL,
 sender_wa_id TEXT NOT NULL,
 message_type TEXT NOT NULL CHECK(message_type IN ('text','audio','image','document','interactive','other')),
 text_body TEXT,
 media_id TEXT,
 language_code TEXT,
 state TEXT NOT NULL DEFAULT 'received' CHECK(state IN ('received','queued','processed','failed','ignored')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wa_inbound_sender ON whatsapp_inbound(business_phone_id,sender_wa_id,created_at);
CREATE TABLE IF NOT EXISTS whatsapp_tenant_routes (
 business_phone_id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL,
 enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
 ai_voice_enabled INTEGER NOT NULL DEFAULT 0 CHECK(ai_voice_enabled IN (0,1)),
 default_language TEXT NOT NULL DEFAULT 'en',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS whatsapp_delivery_log (
 id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL,
 recipient_wa_id TEXT NOT NULL,
 message_type TEXT NOT NULL,
 provider_message_id TEXT UNIQUE,
 status TEXT NOT NULL CHECK(status IN ('pending','sent','delivered','read','failed')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
