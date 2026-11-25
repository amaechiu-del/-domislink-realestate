# DomisLinker → OneLink integration contract

## Status
This branch adds a responsive OneLink-ready marketplace route at `/onelink`, a read-only D1 Worker API, schema and Cloudflare configuration. No production deployment, authentication or payment processing has been activated.

## Architecture
- Frontend: Next.js 16 existing app; new `/onelink` route.
- Marketplace API: Cloudflare Worker `cloudflare/worker.js`.
- Database: D1, schema `cloudflare/schema.sql`.
- Media: future R2 bucket.
- Identity: future OIDC authorization-code + PKCE through `https://sso.domislink.com`. Validate issuer, audience, expiry and JWKS server-side. Do not trust client-supplied agent IDs.
- OneLink app registry: planned app ID `domislinker-property`, route `/onelink`, scopes `marketplace:read`, `listings:write`, `agents:read`. Register in OneLink after verifying its actual registry schema.

## Deployment steps
1. Create D1: `npx wrangler d1 create domislinker-db`.
2. Copy its ID into `cloudflare/wrangler.jsonc`.
3. Apply schema: `npx wrangler d1 execute domislinker-db --remote --file=cloudflare/schema.sql`.
4. Deploy API from cloudflare directory: `npx wrangler deploy --config wrangler.jsonc`.
5. Set `NEXT_PUBLIC_DOMISLINKER_API_URL` to the deployed API URL for the Next.js frontend.
6. Set `APP_ORIGIN` in Worker config to the actual deployed frontend origin.
7. Use a Cloudflare-supported Next.js runtime adapter for dynamic Next.js deployment; do not use static export.
8. Verify `/api/health`, `/api/listings`, and `/onelink` before linking from OneLink.

## Next security and revenue milestones
- OIDC session and authorization middleware; rate limiting.
- Paystack initialize, signed webhook, server-side verify and idempotent publish gate.
- Per-listing fees: rent ₦5,000/45d; sale ₦10,000/45d; tenant ₦3,500/45d; service ₦3,000/45d. Duration: 45/68/90 days, prorated by days/45, rounded to kobo; featured +20%; no discounts.
- Ledger with attributable 70/30 platform/agent commission and verified payouts; never credit on client success alone.
- One paid item per ad, AI-assisted copy and media validation, R2, alerts and audit logging.
- Reconcile 90-day unclaimed commissions and community inactivity policies with applicable legal obligations before automatic forfeiture/deletion.
- Add tests for payment idempotency, unauthorized writes, tenant isolation and fee calculation.

No secret keys belong in Git or client-side JavaScript.
