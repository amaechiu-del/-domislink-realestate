# Milestone 23: OneLink, Paystack, and D1 acceptance gate

## Verified CI
Both **Marketplace verification** and **Node.js CI** succeeded at commit `1104f7d` (GitHub Actions runs 44834046715 and 44834046704). This proves build/test execution, **not** live identity, payment, or database functionality.

## OneLink live acceptance
1. Set the public frontend `APP_ORIGIN`, `ONELINK_CLIENT_ID`, `ONELINK_ISSUER` and a strong server-only `ONELINK_SESSION_KEY`. Configure `ONELINK_AUDIENCE` on the Worker.
2. Register exactly `https://propertymarketplace.domislinker.com/api/onelink/callback` as an authorized OneLink redirect URI. Confirm the OneLink gateway allows this client and origin.
3. Check `GET /api/auth/readiness` on the deployed Worker for discovery and PKCE S256. Confirm browser login -> callback -> authenticated draft creation -> session expiry. Reject bad state, bad nonce, expired JWT, wrong audience and wrong issuer. Never log tokens.
4. Check the frontend-to-Worker API origin and any server proxy credentials. A successful discovery endpoint alone does not prove login.

## Paystack sandbox acceptance
1. Configure only a **test** Paystack secret in a nonproduction Worker; do not expose it in NEXT_PUBLIC variables.
2. Create a draft as a signed-in OneLink test user, request a quote, initialize checkout, and pay with Paystack's documented test methods.
3. Verify payment on the server against Paystack, including reference, amount, currency and success status. Confirm a single listing publication and a single 30% referral ledger credit, even after repeated verify calls and duplicate signed webhooks.
4. Verify forged signatures are rejected, pending/failed payments do not publish, and self-referrals are rejected.
5. Keep payouts and refund-confirmation automation disabled until independent provider evidence and reviewer authorization are implemented.

## D1 release order
1. Replace `REPLACE_WITH_D1_DATABASE_ID` in `cloudflare/wrangler.jsonc` with the actual D1 ID. Verify the Worker binding is named `DB`.
2. Take a backup of existing production data; do not overwrite an existing populated database with seed data.
3. Apply `cloudflare/schema.sql` to a **new empty** database, or inspect existing schema and migration history first.
4. Run `cloudflare/d1-release-preflight.sql` before migration 0003. Resolve duplicates, orphans and invalid amounts **without deleting payment history**.
5. Apply migrations in order: `0002_payment_fulfillment.sql`, `0003_payment_reservations_adjustments.sql`, `0004_commission_adjustments.sql`, `0005_adjustment_reviews.sql`. Note: preflight SQL uses the base schema; run it **before** schema changes if checking an existing database.
6. Confirm `PRAGMA foreign_key_check`, table and index existence, a draft listing insert, quote/checkout, webhook fulfillment, and duplicate-event idempotency against an isolated D1 test database.

## Release blockers
- D1 database ID remains a placeholder in repository config.
- No live OneLink sign-in or Paystack sandbox end-to-end evidence has been recorded.
- Migration 0003's unique index may fail on existing outstanding payment duplicates and may prevent retry after an abandoned pending checkout; reconcile reservation lifecycle before live paid traffic.
- Financial reviewer operation is internal-only and must not be exposed without verified finance authorization.
- A reproducible package-lock.json and npm audit review remain recommended before production.
