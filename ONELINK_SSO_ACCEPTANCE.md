# OneLink SSO integration acceptance contract

## Identity provider discovery (required before browser sign-in)
Confirm these from the deployed OneLink service, not from guessed domain paths:

- HTTPS issuer URL and OpenID discovery document
- Authorization endpoint and token endpoint
- JWKS URL hosted on the same origin as the issuer
- Public OAuth client ID for DomisLinker
- Registered callback URL and allowed logout URLs
- Audience of the access token used for the marketplace API
- Authorization-code + PKCE support, scopes and token lifetime
- How the existing OneLink browser session is shared with DomisLinker

The API currently expects RS256 signed JWT access tokens, `ONELINK_ISSUER`, `ONELINK_AUDIENCE` and optional `ONELINK_JWKS_URL`. This must match the actual provider before the frontend is connected. Never use ID tokens as API bearer credentials unless the identity service explicitly issues them for this audience.

## Required browser flow
1. Redirect user to the actual provider authorization endpoint using PKCE S256, a fresh nonce and a state value.
2. Exchange authorization code securely, validate state and token claims.
3. Use an HttpOnly, Secure, SameSite cookie backed by a server-side session (or a carefully scoped BFF) for browser authentication.
4. The browser submits drafts and payments through the authenticated backend; do not store bearer tokens in localStorage or request users to paste them.
5. Logout revokes or invalidates the local session and follows the provider's supported logout contract.

## Marketplace deployment checks
- Set `APP_ORIGIN` to the actual frontend origin, not a proposed hostname.
- Apply D1 schema and migration before enabling checkout.
- Configure Paystack secret only in Cloudflare secrets.
- Confirm `/api/communities` returns real approved communities.
- Run `node --experimental-default-type=module --test cloudflare/*.test.mjs`.
- Test draft creation, OneLink subject ownership, Paystack initialize/verify, signed webhook replay, duplicate payment handling and commission idempotency.
- Confirm Paystack callback URL is a registered/working HTTPS page.
- Verify GitHub Actions starts; a workflow configuration commit alone is not a passing check.

## Unfinished
The user-facing draft form is not connected to a live OneLink session. The payment return page is informational only. No live SSO, checkout, or production release is confirmed.
