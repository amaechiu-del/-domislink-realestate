-- Run as read-only operational reconciliation queries against D1.
-- Successful payments without completed advertisement publication:
SELECT p.reference,p.listing_id,p.amount_kobo,p.created_at,l.status AS listing_status,l.payment_reference
FROM payments p JOIN listings l ON l.id=p.listing_id
WHERE p.status='success' AND (p.fulfilled_at IS NULL OR l.payment_reference<>p.reference)
ORDER BY p.created_at DESC;

-- More than one successful payment for a listing (manual refund review):
SELECT listing_id,COUNT(*) AS successful_payments,SUM(amount_kobo) AS total_kobo
FROM payments WHERE status='success' GROUP BY listing_id HAVING COUNT(*)>1;

-- Fulfilled agent payments missing a commission:
SELECT p.reference,p.agent_id,p.amount_kobo
FROM payments p LEFT JOIN commission_ledger c ON c.payment_id=p.id
WHERE p.status='success' AND p.fulfilled_at IS NOT NULL AND p.agent_id IS NOT NULL AND c.payment_id IS NULL;

-- Ledger entries that do not correspond to a fulfilled successful payment:
SELECT c.payment_id,c.agent_id,c.amount_kobo
FROM commission_ledger c LEFT JOIN payments p ON p.id=c.payment_id
WHERE p.id IS NULL OR p.status<>'success' OR p.fulfilled_at IS NULL;
