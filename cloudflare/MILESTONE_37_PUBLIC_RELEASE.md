# Milestone 37 — Public marketplace release gates

The public marketplace now fetches published listings through the same-origin Next.js route `/api/onelink/public-listings`, using server-side `DOMISLINKER_API_URL`. It no longer depends on a browser-visible Worker URL.

## Required configuration
**Next.js frontend:** `DOMISLINKER_API_URL` (HTTPS Worker origin), `APP_ORIGIN` (exact HTTPS frontend origin), `ONELINK_ISSUER`, `ONELINK_CLIENT_ID`, `ONELINK_SESSION_KEY` (64 hexadecimal characters). Verify OneLink redirect URI `/api/onelink/callback` is registered.

**Cloudflare Worker:** real D1 UUID in `cloudflare/wrangler.jsonc`, D1 migrations applied, `ONELINK_AUDIENCE` and Paystack **test** `PAYSTACK_SECRET_KEY` set as Worker secrets. GitHub deploy workflow also needs `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `DOMISLINKER_WORKER_HEALTH_URL`.

## Acceptance order
1. GitHub verification passes on the release commit.
2. Cloudflare D1 bootstrap and Worker `/api/ready` pass.
3. Deploy Next.js frontend, verify `/onelink` loads real public listings and no browser Worker URL configuration is needed.
4. Verify OneLink authorization code + PKCE, callback session, authenticated draft creation.
5. Complete Paystack sandbox checkout and webhook, then verify listing publication, commission idempotency, failed-payment recovery.
6. Approve live-payment enablement only after recorded end-to-end evidence.

No claim of deployed production or successful sandbox payment is implied by this file.
