-- Read-only financial dashboard queries; run on a restricted administrative D1 connection.
-- Payments awaiting provider verification or reconciliation
SELECT p.reference,p.listing_id,p.status,p.amount_kobo,p.created_at
FROM payments p WHERE p.status='pending'
ORDER BY p.created_at ASC LIMIT 100;

-- Refunds and disputes awaiting authorized review
SELECT a.id,a.kind,a.state,a.amount_kobo,p.reference,p.amount_kobo AS original_amount_kobo,a.created_at
FROM payment_adjustments a JOIN payments p ON p.id=a.payment_id
WHERE a.state='pending' ORDER BY a.created_at ASC LIMIT 100;

-- Net commissions, before payout authorization. Pending adjustments must block payouts.
SELECT c.agent_id,c.payment_id,c.amount_kobo AS earned_kobo,
COALESCE((SELECT SUM(x.amount_kobo) FROM commission_adjustments x WHERE x.payment_id=c.payment_id),0) AS reversal_kobo,
c.amount_kobo+COALESCE((SELECT SUM(x.amount_kobo) FROM commission_adjustments x WHERE x.payment_id=c.payment_id),0) AS net_kobo,
CASE WHEN EXISTS(SELECT 1 FROM payment_adjustments a WHERE a.payment_id=c.payment_id AND a.state IN ('pending','confirmed')) THEN 1 ELSE 0 END AS payout_hold
FROM commission_ledger c ORDER BY c.created_at DESC LIMIT 100;
