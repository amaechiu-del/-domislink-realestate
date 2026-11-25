-- Milestone 47H: one reservation per draft regardless of text/audio channel.
CREATE TABLE IF NOT EXISTS whatsapp_unified_send_reservations (
 draft_id TEXT PRIMARY KEY REFERENCES whatsapp_reply_drafts(id),
 tenant_id TEXT NOT NULL,
 channel TEXT NOT NULL CHECK(channel IN ('text','audio')),
 reservation_id TEXT NOT NULL UNIQUE,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS whatsapp_paystack_transactions (
 reference TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL,
 amount_kobo INTEGER NOT NULL CHECK(amount_kobo>0),
 currency TEXT NOT NULL DEFAULT 'NGN',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected')),
 paystack_transaction_id TEXT UNIQUE,
 verified_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS whatsapp_contact_consent_events (
 id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL,
 recipient_wa_id TEXT NOT NULL,
 outbound_opt_in INTEGER NOT NULL CHECK(outbound_opt_in IN (0,1)),
 voice_opt_in INTEGER NOT NULL CHECK(voice_opt_in IN (0,1)),
 source TEXT NOT NULL,
 recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
