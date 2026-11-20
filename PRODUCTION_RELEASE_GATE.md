# Marketplace production release gate — 2026-11-20

## Current status
Feature branch only. Code committed; no successful deployed end-to-end checkout or production rollout has been verified.

## Configuration
- Register marketplace OAuth client with the real OneLink SSO gateway and callback `https://<frontend-origin>/api/onelink/callback`.
- Set Next.js server-only `ONELINK_CLIENT_ID`, `ONELINK_ISSUER`, `ONELINK_SESSION_KEY` (64 hex chars), `APP_ORIGIN` and `DOMISLINKER_API_URL`.
- Set public `NEXT_PUBLIC_DOMISLINKER_API_URL` to the deployed Worker.
- Configure Cloudflare Worker `ONELINK_ISSUER`, `ONELINK_AUDIENCE`, `APP_ORIGIN`, D1 `DB`, and secret `PAYSTACK_SECRET_KEY`.
- Set Paystack webhook to `https://<api-origin>/api/payments/webhook` and confirm signatures.
- Replace D1 placeholder ID and apply `schema.sql` then `migrations/0002_payment_fulfillment.sql`.
- Seed real approved communities.

## Acceptance tests — must pass before live checkout
1. OIDC discovery and PKCE login, invalid state/nonce, expired token, tampered cookie, logout and session expiry.
2. Advertiser creates own draft, cannot alter another advertiser's draft, rejects cross-origin POST.
3. Checkout initializes correct NGN amount and callback; rejects non-draft listings and foreign owners.
4. Paystack test transaction succeeds and is verified server-side; failed/mismatched amounts never publish.
5. Webhook signature invalid/replayed/duplicate; fulfillment and commission are idempotent.
6. Two concurrent payments for same listing: exactly one publication, second reconciled/refunded.
7. Referral 30% ledger is correct and cannot be self-awarded; refunds and disputes reverse or hold commissions.
8. CI syntax/unit tests and Next.js build pass, then staging smoke tests and production health checks.

## Known blockers
- OAuth client registration, issuer discovery, session interoperability and live sign-in not verified.
- Commission refund/reversal, duplicate-payment reconciliation and agent self-referral protections remain incomplete.
- Browser-side encrypted cookie session is implemented but not backed by a revocable server-side session store.
- No proof of successful GitHub Actions execution or real Paystack sandbox transaction.
- Do not merge or enable live payment collection until the blockers are resolved.
