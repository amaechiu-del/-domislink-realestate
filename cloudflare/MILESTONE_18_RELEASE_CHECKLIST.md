# Milestone 18 — build reliability and financial reporting

Delivered:
- Corrected a JavaScript syntax defect in `cloudflare/adjustment-review.js`.
- Extended PR CI to include `src/app/api/onelink/**` changes.
- Added `npm ci` and `npm run build` to marketplace PR checks.
- Added read-only D1 finance queries for pending payments, financial adjustment review and net commission reporting with payout-hold flags.

Release blockers:
1. Confirm the actual GitHub Actions workflow starts and all tests/build checks pass.
2. Validate Paystack refund/dispute event shapes against provider documentation and test notifications.
3. Secure the finance reviewer authorization and verify refund status directly with Paystack.
4. Execute D1 migrations 0003–0005 with backup and duplicate-payment inspection.
5. Run real D1 concurrency tests and sandbox payment/refund end-to-end tests.
6. Verify OneLink login, logout and session expiration on the intended domain.
7. Keep live payments and commission payouts disabled until acceptance evidence is recorded.

No production deployment or successful CI run is claimed in this milestone.
