-- A renewal creates a new draft and requires a new verified payment.
-- Preserve the original listing and payment/commission history.
ALTER TABLE listings ADD COLUMN renewal_of_id TEXT REFERENCES listings(id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_listing_renewal_source ON listings(renewal_of_id) WHERE renewal_of_id IS NOT NULL;
