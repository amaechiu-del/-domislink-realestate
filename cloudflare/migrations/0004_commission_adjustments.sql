-- Immutable commission adjustment entries. Never rewrite original commission ledger rows.
CREATE TABLE IF NOT EXISTS commission_adjustments (
 id TEXT PRIMARY KEY,
 payment_adjustment_id TEXT NOT NULL UNIQUE REFERENCES payment_adjustments(id),
 payment_id TEXT NOT NULL REFERENCES payments(id),
 agent_id TEXT NOT NULL REFERENCES agents(id),
 amount_kobo INTEGER NOT NULL CHECK(amount_kobo<=0),
 reason TEXT NOT NULL CHECK(reason IN ('refund','chargeback')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_commission_adjustments_payment ON commission_adjustments(payment_id);
-- An adjustment requires verified provider reconciliation and authorized review before confirmation.
-- The application must not interpret pending adjustments as confirmed refunds.
