# DomisLinker API — next implementation milestone

## Included
- Read-only public listing API, D1 schema, health endpoint
- Fee quote module with automated Node test
- OIDC RS256 signature and issuer/audience/expiry verification helper for future protected endpoints
- **No unverified paid publication, wallet withdrawals or client-controlled commissions**

## Tests
Run `node --test cloudflare/pricing.test.mjs` from the repository root after configuring ESM support, or `node --experimental-default-type=module --test cloudflare/pricing.test.mjs` on Node 22+.

## Integration prerequisites
The OneLink team must provide actual issuer, audience and JWKS URL. The verification helper is not yet wired to a session or user endpoint; tokens cannot be treated as authenticated until endpoint authorization is implemented. Keep all write endpoints disabled until owner identity, Paystack verification and idempotent fulfillment are implemented.

The fee figures are provisional and should be confirmed before accepting payments.
