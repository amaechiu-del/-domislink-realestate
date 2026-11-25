# Milestone 17 acceptance — finance review engine

## Committed
- Migration 0005 adds one auditable review per financial adjustment.
- Internal `reviewFinancialAdjustment` helper validates review inputs, records review and adjustment status in one D1 batch, and inserts negative commission adjustments for confirmed refunds/chargebacks.
- Reversals are proportionate to refund amount and capped against the existing recorded commission balance.
- Unit tests cover missing evidence, over-refunds and reversal caps.

## Critical incomplete controls
- **Do not call the internal helper from a public endpoint.** It trusts its caller to perform authorization and independently verify Paystack evidence; it does not itself contact Paystack or validate the reviewer's permissions.
- Concurrent reviews and multiple simultaneous partial reversals require transaction-level verification and race tests.
- Real Paystack refund/dispute verification, payout-service enforcement, accounting approval workflow, and payout suspension are not yet integrated.
- The helper is not wired to a production service. These are committed components, not live financial operations.
- Unit tests have not been executed here. GitHub Actions and production deployment are unverified.

## Before production
1. Confirm real Paystack event schema and provider verification API.
2. Wire server-side provider verification and role-based finance approvals.
3. Execute D1 migrations 0003–0005 after duplicate reservation inspection.
4. Run Node tests, Next.js build, D1 concurrency tests and sandbox payment/refund lifecycle.
5. Enforce net commission balances and adjustment holds in the actual payout service.
6. Merge and deploy only after acceptance evidence is recorded.
