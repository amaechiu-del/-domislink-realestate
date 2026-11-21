# Milestone 14: payment and commission controls

Implemented:
- Reject advertiser self-referral when the agent OneLink subject equals the listing owner's subject.
- Reject unrecognized agent referral codes rather than silently discarding them.
- Reject a new checkout when a prior payment for that listing remains pending or successful.
- Provide read-only D1 reconciliation queries in `cloudflare/reconciliation.sql`.

Important limits:
- The pre-check is not an atomic D1 uniqueness constraint. Two simultaneous checkout requests can still race. Add a schema-level payment reservation or conditional insert before enabling real payments.
- A Paystack initialization failure can leave a pending row that needs reconciliation; do not automatically discard a reference that might later succeed.
- Refunds, chargebacks, payout holds and reversal entries are not yet implemented. Do not pay out commissions based solely on the current ledger.
- D1 reconciliation queries are diagnostic only; they do not initiate refunds or change balances.
- No end-to-end tests, GitHub Actions pass, or production release has been confirmed.

Release prerequisites: enforce atomic checkout reservation; test duplicate and concurrent callbacks; confirm OneLink OIDC client registration and real session exchange; execute CI and Paystack test payments; implement refund/chargeback commission handling; only then merge and deploy.
