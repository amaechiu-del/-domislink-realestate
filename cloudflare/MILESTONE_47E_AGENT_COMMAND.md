# Milestone 47E — OneLink Agent Command Centre

## Built
- OneLink bearer-token authenticated `GET /api/agents/inbox`, `POST /api/agents/drafts`, `POST /api/agents/reviews` backed by D1 role grants.
- Roles: viewer (read), agent (read/draft), reviewer and admin (read/draft/approve/reject). Tenant grants are checked against the verified OneLink `sub` on **every request**.
- Same-origin encrypted-session proxy `/api/onelink/agents` and browser command centre at `/onelink/agents`.
- Audited draft creation and review decisions; **approval never triggers an outbound WhatsApp message**.
- Meta signed webhook status events update only previously known outgoing IDs and the matching tenant's delivery ledger.
- Migration `0011_whatsapp_agent_command.sql`, migration lifecycle checks, authentication and delivery-isolation tests.

## Required production setup
1. Apply migration 0011 to an existing D1 database after a backup; never run fresh bootstrap on populated D1.
2. Provision tenant grants in `whatsapp_agent_memberships` from a **trusted administrative process** after verifying tenant ownership. There is deliberately no public self-grant API.
3. Configure OneLink issuer, audience, JWKS, browser encrypted session key and backend API URL.
4. Verify real Meta webhook signatures, provider message IDs, delivery callbacks, and agent role isolation.

## Not yet complete
- Actual Meta outbound sending, template approval, 24-hour customer-service window enforcement, customer opt-in management and billing.
- OneLink role provisioning/management UI and role revocation audit.
- Full message timeline pagination, immutable transactional review auditing, customer-facing human escalation and ElevenLabs voice synthesis.
- Live Cloudflare deployment. The Wrangler D1 UUID remains a placeholder.

**Deployment status:** source committed, live provider acceptance and production deployment unverified.
