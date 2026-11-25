# Milestone 16 — signed adjustment intake and append-only commission accounting

## Implemented
- HMAC-verified Paystack webhook recognizes `refund.processed`, `chargeback.create`, and `dispute.create` using the event classifier.
- Matching payments receive an idempotent **pending** adjustment record. Duplicate provider event IDs cannot create repeated records.
- Append-only `commission_adjustments` schema supports negative reversal entries, linked to verified adjustment records.
- Unit tests cover signature rejection, recognized signed refund intake, and unrelated events.

## Financial safeguards
- The webhook does not initiate a refund, mark an adjustment confirmed, or create commission reversal entries automatically.
- An incoming event alone is not independent provider verification. Confirm amounts, refund status, dispute outcome and original transaction with Paystack before authorizing a confirmed adjustment.
- A pending adjustment blocks commission payout *only when payout eligibility is evaluated using the persisted adjustments*. No payout endpoint is currently wired to this helper.
- Existing commission ledger remains immutable; approved reversals must be inserted exactly once using the unique adjustment ID.
- Do not enable payouts until approved reversal posting and payout eligibility are enforced in the actual payout service.

## Production gates still open
1. Verify the exact Paystack refund and dispute event payload shapes against real sandbox notifications; refine classifier as needed.
2. Run D1 migrations 0003 and 0004 after inspecting outstanding duplicates.
3. Build provider-confirmed adjustment state transitions, authorized approval and reversal posting.
4. Add D1 concurrency and integration tests for simultaneous checkout and webhook retries.
5. Run CI and Next.js build; test OneLink login, Paystack test payment and complete refund lifecycle.
6. Merge and deploy only after the above acceptance checks pass.

No production migration, payout or deployment is claimed.
