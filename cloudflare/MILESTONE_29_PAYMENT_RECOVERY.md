# Milestone 29 — Provider-confirmed payment recovery

The owner-only POST /api/payments/reconcile endpoint checks the payment reference against Paystack's transaction verification API. A reservation is released only when Paystack explicitly reports `failed` and reference, currency, and amount match the stored transaction. Provider `success` instructs the user to run normal payment verification; `abandoned`, `ongoing`, `pending`, provider errors, and mismatches remain blocked.

**Important:** Provider `failed` is not proof that every possible delayed notification is impossible. Before production, verify Paystack's finality semantics and implement late-success conflict review. Do not enable automatic repeated retry for ambiguous transactions.

## Acceptance tests to complete with test credentials
1. A pending checkout returns `retry_allowed=false`.
2. A forged or another user's reference returns 404; invalid reference returns 400.
3. Paystack timeout, amount mismatch, or `abandoned` never unlocks a checkout.
4. Paystack confirmed `failed` marks only the matching pending payment failed; subsequent checkout can create a new reservation.
5. A verified `success` is not marked failed; use existing payment verification for idempotent publication.
6. Duplicate webhook delivery never duplicates commission ledger entries; late success after a retry must enter manual reconciliation rather than publish twice.
7. Test with an isolated D1 database after migrations 0002-0006.

**Deployment gate:** Remote D1 ID is still a placeholder; live OneLink and Paystack test transactions have not been verified. No production readiness claim.
