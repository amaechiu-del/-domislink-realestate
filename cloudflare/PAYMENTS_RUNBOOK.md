# Milestone 5 — Paystack fulfillment runbook

## Deployment order
1. Apply `cloudflare/schema.sql` to a new D1 database (only once).
2. Apply `cloudflare/migrations/0002_payment_fulfillment.sql` once to existing schema, before deploying the updated Worker.
3. Set `PAYSTACK_SECRET_KEY` using `wrangler secret put PAYSTACK_SECRET_KEY`. Never commit it.
4. Configure the actual OneLink OIDC issuer, audience and same-origin JWKS endpoint.
5. Verify that listing creation is still disabled, and only approved server-created drafts can enter checkout.
6. Run tests and an end-to-end Paystack **test-mode** transaction with the actual deployed Worker.
7. Validate duplicate verification, competing payments, failed payments, mismatched amounts, expired credentials and commission ledger uniqueness before enabling production.

## API
- `POST /api/payments/initialize` with OneLink bearer token, `listing_id`, `email`, `days`, `featured`, optional `referral_code`.
- `POST /api/payments/verify` with OneLink bearer token and `reference`.
- `POST /api/pricing/quote` provides an estimate only.

## Financial safeguards
- Client cannot supply the amount or agent ID.
- Amount, currency and reference must match Paystack's server-side verification.
- Payment is recorded as successful before any publication, and fulfillment uses a D1 transaction batch.
- Only the first payment that claims a draft listing can publish it. Additional successful payments for that listing require reconciliation/refund.
- Agent commission is recorded at 30% of the verified listing payment only when a referral agent is attached. This split is provisional until approved.
- Never pay out based only on the presence of a commission ledger entry. Payouts require a separate authenticated settlement workflow.
- A Paystack signed webhook and reconciliation job are still required for automatic processing when users do not return to the app.

## Known blockers
- No authenticated listing draft-creation route yet; checkout cannot serve the full user journey.
- No OneLink login UI/token acquisition yet.
- No Paystack webhook signature verification, retry handling, reconciliation or refund automation.
- No deployment or live payment test has been performed.
- Existing successful payment records predating this migration may need manual reconciliation.
