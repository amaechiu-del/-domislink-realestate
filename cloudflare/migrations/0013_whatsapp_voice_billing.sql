-- Milestone 47G: usage accounting, template approvals and voice send reservations.
CREATE TABLE IF NOT EXISTS whatsapp_approved_templates (
 id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL,
 business_phone_id TEXT NOT NULL,
 template_name TEXT NOT NULL,
 language_code TEXT NOT NULL,
 category TEXT NOT NULL CHECK(category IN ('UTILITY','MARKETING','AUTHENTICATION')),
 approval_status TEXT NOT NULL DEFAULT 'pending' CHECK(approval_status IN ('pending','approved','rejected','paused')),
 verified_at TEXT,
 UNIQUE(tenant_id,business_phone_id,template_name,language_code)
);
CREATE TABLE IF NOT EXISTS whatsapp_usage_events (
 id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL,
 operation TEXT NOT NULL CHECK(operation IN ('transcription','translation','tts','text_send','audio_send','template_send')),
 units INTEGER NOT NULL CHECK(units BETWEEN 1 AND 1000000),
 provider_reference TEXT,
 source_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(tenant_id,operation,source_id)
);
CREATE INDEX IF NOT EXISTS idx_wa_usage_tenant_month ON whatsapp_usage_events(tenant_id,created_at);
CREATE TABLE IF NOT EXISTS whatsapp_voice_send_requests (
 id TEXT PRIMARY KEY,
 draft_id TEXT NOT NULL UNIQUE REFERENCES whatsapp_reply_drafts(id),
 tenant_id TEXT NOT NULL,
 media_id TEXT,
 state TEXT NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','uploading','sending','sent','unknown','failed')),
 provider_message_id TEXT UNIQUE,
 error_code TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS whatsapp_billing_plans (
 tenant_id TEXT PRIMARY KEY,
 monthly_voice_seconds INTEGER NOT NULL DEFAULT 0,
 monthly_text_messages INTEGER NOT NULL DEFAULT 0,
 paystack_customer_code TEXT,
 paystack_subscription_code TEXT,
 billing_status TEXT NOT NULL DEFAULT 'inactive' CHECK(billing_status IN ('inactive','pending','active','past_due')),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
