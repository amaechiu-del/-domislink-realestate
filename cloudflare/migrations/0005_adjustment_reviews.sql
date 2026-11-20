-- Milestone 17: review provenance and unique provider verification evidence.
CREATE TABLE IF NOT EXISTS adjustment_reviews (
 id TEXT PRIMARY KEY,
 payment_adjustment_id TEXT NOT NULL UNIQUE REFERENCES payment_adjustments(id),
 reviewer_subject TEXT NOT NULL,
 provider_verified_at TEXT NOT NULL,
 provider_evidence_reference TEXT NOT NULL,
 decision TEXT NOT NULL CHECK(decision IN ('confirm','reject')),
 reviewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Review and ledger updates must be applied in a single D1 transaction/batch.
