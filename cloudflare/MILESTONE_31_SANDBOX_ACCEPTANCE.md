# Milestone 31 — Sandbox acceptance checklist

## Automated checks
- `node --experimental-default-type=module --test cloudflare/*.test.mjs`
- `node scripts/release-preflight.mjs`
- `npm run build`

## Provision D1 (operator action)
1. Run `npx wrangler d1 create domislinker-db` in the Cloudflare account that will host the Worker.
2. Set the returned database UUID in `cloudflare/wrangler.jsonc`. Do not commit credentials.
3. Apply `cloudflare/schema.sql`, then migration files `0002` through `0006` **in order**, to a disposable sandbox D1 database first. Check each migration for prior application.
4. Run `cloudflare/d1-release-preflight.sql` and investigate any duplicates or orphan records before production.
5. Configure Worker secrets `PAYSTACK_SECRET_KEY`, `ONELINK_AUDIENCE`, and OneLink OIDC verification settings. Never put secret values in source control.

## Provider sandbox
- Complete OneLink login, create a draft, and initialize Paystack **test** checkout.
- Verify successful payment publication once and a single 30% commission entry when a valid agent referral applies.
- Verify declined payment remains blocked until provider-confirmed terminal failure and reconciliation.
- Verify timeout, pending/abandoned state, wrong amount/currency/reference, duplicate webhook, and late-success manual review.
- Confirm the Paystack webhook points to the deployed Worker route `/api/payments/webhook` and the HMAC secret is configured.

## Release gates
Both GitHub workflows must pass at the latest commit. A GitHub green check is **not** proof of Cloudflare deployment, real OneLink login, D1 migration, or live Paystack acceptance.
