-- Milestone 15: one outstanding charge per advertisement, enforced in SQLite/D1.
-- Resolve existing duplicates before applying this index; the migration will fail if duplicates exist.
CREATE UNIQUE INDEX IF NOT EXISTS uq_listing_outstanding_payment
ON payments(listing_id) WHERE status IN ('pending','success');
-- Refund/dispute events are recorded without deleting payment history.
CREATE TABLE IF NOT EXISTS payment_adjustments (
 id TEXT PRIMARY KEY,
 payment_id TEXT NOT NULL REFERENCES payments(id),
 provider_event TEXT NOT NULL,
 provider_reference TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('refund','chargeback','dispute')),
 state TEXT NOT NULL CHECK(state IN ('pending','confirmed','rejected')),
 amount_kobo INTEGER NOT NULL CHECK(amount_kobo>=0),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(provider_event,provider_reference)
);
CREATE INDEX IF NOT EXISTS idx_payment_adjustments_payment ON payment_adjustments(payment_id);
