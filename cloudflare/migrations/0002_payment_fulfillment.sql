-- Apply after cloudflare/schema.sql, before deploying payment fulfillment.
ALTER TABLE payments ADD COLUMN duration_days INTEGER NOT NULL DEFAULT 45 CHECK(duration_days IN (45,68,90));
ALTER TABLE payments ADD COLUMN featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1));
ALTER TABLE payments ADD COLUMN fulfilled_at TEXT;
CREATE INDEX IF NOT EXISTS idx_payments_listing ON payments(listing_id,status);
