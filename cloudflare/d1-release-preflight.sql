-- DomisLinker D1 release preflight (read-only).
-- Run after the base schema and before migrations 0002-0005.
-- Every result set below should be empty unless documented and reconciled.
-- 1. Duplicate outstanding payments would block migration 0003.
SELECT listing_id, COUNT(*) AS outstanding_count
FROM payments WHERE status IN ('pending','success') AND listing_id IS NOT NULL
GROUP BY listing_id HAVING COUNT(*) > 1;
-- 2. Orphan payments: listing and agent references must exist.
SELECT p.id,p.reference FROM payments p LEFT JOIN listings l ON l.id=p.listing_id
WHERE p.listing_id IS NOT NULL AND l.id IS NULL;
SELECT p.id,p.reference FROM payments p LEFT JOIN agents a ON a.id=p.agent_id
WHERE p.agent_id IS NOT NULL AND a.id IS NULL;
-- 3. Duplicate commission entries (defense in depth).
SELECT payment_id,COUNT(*) AS count FROM commission_ledger
GROUP BY payment_id HAVING COUNT(*) > 1;
-- 4. Commissions lacking a valid payment.
SELECT c.id,c.payment_id FROM commission_ledger c LEFT JOIN payments p ON p.id=c.payment_id
WHERE p.id IS NULL;
-- 5. Nonpositive payments or commission amounts.
SELECT id,reference,amount_kobo FROM payments WHERE amount_kobo<=0;
SELECT id,payment_id,amount_kobo FROM commission_ledger WHERE amount_kobo<0;
