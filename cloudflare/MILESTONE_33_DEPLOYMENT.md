# Milestone 33 — Controlled Cloudflare release

The manual GitHub Actions workflow `Marketplace Cloudflare deployment` runs only when dispatched. Its production environment should require approval. It will not provision a D1 database or apply migrations automatically.

Before dispatch:
1. Create `domislinker-db` in the intended Cloudflare account and set its real UUID in `cloudflare/wrangler.jsonc`.
2. Apply `cloudflare/schema.sql` and migrations `0002`–`0006` in order with Wrangler, checking migration history to avoid duplicate ALTER statements.
3. Configure GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and repository variable `DOMISLINKER_WORKER_HEALTH_URL` with the exact deployed Worker origin (no trailing /api/ready).
4. Set Worker secrets `PAYSTACK_SECRET_KEY` and `ONELINK_AUDIENCE`. Configure the Next.js `DOMISLINKER_API_URL` and `ONELINK_SESSION_KEY` separately; verify OneLink OIDC issuer and callback registration.
5. Use Paystack sandbox keys first. Confirm webhook URL and signed delivery; complete test payment, idempotency, and late-success review.

The deployment workflow verifies source and test checks, deploys the Worker, and then requests `/api/ready`. The readiness endpoint checks D1 connectivity and expected schema. `/api/health` remains liveness only.

**Release limitation:** The workflow deploys the Worker API, not the Next.js frontend, DNS, D1 migrations, or OneLink gateway. Passing CI or `/api/ready` is not proof of end-to-end payments.
