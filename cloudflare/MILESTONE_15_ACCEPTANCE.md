# Milestone 15 — production acceptance gate

## Delivered
- `0003_payment_reservations_adjustments.sql`: unique partial index prevents simultaneous pending/successful payment reservations for a listing; adds adjustment audit schema.
- Checkout handles reservation insert conflicts with a 409 rather than initiating Paystack.
- `financial-controls.js`: payout-eligibility rule denies commission payout on pending or confirmed refunds, chargebacks or disputes.
- `financial-controls.test.mjs`: unit coverage for holds and event classification.

## Mandatory pre-migration inspection
Run before applying migration 0003:
```sql
SELECT listing_id, COUNT(*) AS outstanding
FROM payments WHERE status IN ('pending','success')
GROUP BY listing_id HAVING COUNT(*)>1;
```
Resolve each row through documented provider verification and financial review. Never delete or silently mark a charged transaction failed just to force the index to apply.

## Still not implemented
- Signed refund/dispute webhook ingestion into `payment_adjustments`; the helper classifies events but does not persist them.
- Automated refund execution, payout ledger, actual commission disbursement, reversal accounting, and safe reservation release.
- Integration tests with real D1 transactions and Paystack sandbox callbacks.
- OneLink OIDC production credentials and a verified live browser login.
- Passing CI, build and deployment evidence.

## Release gate
Do not enable commission payouts or production Paystack payments until all the above gaps are closed, migrations are applied to the actual D1 database, CI passes and a full sandbox payment + refund/chargeback lifecycle is verified.
