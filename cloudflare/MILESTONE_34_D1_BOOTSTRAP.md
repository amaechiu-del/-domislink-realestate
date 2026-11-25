# Milestone 34 — Fresh D1 provisioning runbook

## Current state
GitHub verification is green at the Milestone 33 commit. The repository still has `REPLACE_WITH_D1_DATABASE_ID`; no remote D1 database has been provisioned or tested in this milestone.

## Operator procedure (PowerShell)
Run in the repository root on the intended Cloudflare account:

```powershell
npx wrangler@4 login
npx wrangler@4 d1 create domislinker-db
# Copy the returned database UUID into cloudflare/wrangler.jsonc
node scripts/d1-bootstrap.mjs
# Inspect the planned schema and migrations before applying
$env:DOMISLINKER_CONFIRM_EMPTY_DB = "domislinker-db"
# CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be available in the environment
node scripts/d1-bootstrap.mjs --remote --apply
```

The bootstrap script refuses to modify any database that already contains marketplace tables, and aborts at the first failed migration. It is intended only for a **new, empty database**. A partially applied bootstrap must be investigated and repaired manually; do not simply rerun it.

The bootstrap does not create a Cloudflare account, configure domain routing, set Worker secrets, deploy the Next.js frontend, or prove live OneLink and Paystack integration.

## After provisioning
1. Verify remote schema and the `/api/ready` endpoint after the Worker deploy.
2. Configure OneLink audience and callback; verify authentication against the deployed gateway.
3. Use Paystack **test keys** and a real signed webhook delivery to test payment success, failure, duplicate webhook, and late-success handling.
4. Keep live charges disabled until test evidence and approval are recorded.
