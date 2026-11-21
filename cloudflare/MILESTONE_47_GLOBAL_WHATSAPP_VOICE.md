# Milestone 47 — DomisLink Global WhatsApp Voice Gateway

## Delivered in this repository
- Meta WhatsApp webhook GET verification and signed POST intake at `/api/whatsapp/webhook`.
- Signature verification uses HMAC-SHA256 over the exact raw request body and rejects missing/forged signatures.
- D1 migration `0008_whatsapp_voice_gateway.sql`: isolated business-number → tenant routing, opt-in enabled flag, text/audio/media event ledger, idempotent Meta message IDs, delivery-status schema.
- Inbound text and voice-note media identifiers are recorded without automatically downloading personal recordings or sending unsolicited replies.
- Tests exercise challenge verification, forged signatures, tenant routing, voice-note ingestion, duplicate events and schema migration.

## Configuration
Configure these as **Cloudflare Worker secrets**, never public Next.js variables:
`WHATSAPP_APP_SECRET` — Meta app secret; `WHATSAPP_VERIFY_TOKEN` — random verification challenge token.
For the next outbound/voice-processing phase, provision `WHATSAPP_ACCESS_TOKEN`, `ELEVENLABS_API_KEY`, an approved business number and explicit tenant consent/retention settings. These additional keys are **not consumed by the current inbound-only gateway**.

In Meta developer settings, configure the webhook callback as `https://<your-worker-host>/api/whatsapp/webhook`, subscribe to message events, and verify the challenge. Register each `phone_number_id` to exactly one tenant in `whatsapp_tenant_routes` and set `enabled=1` only after authorization.

## Phase 47B (not yet implemented)
- Secure queue consumer for WhatsApp voice-note media, Meta Graph download and ElevenLabs transcription, with explicit consent and retention controls.
- Language detection and optional translation; human-review fallback for unsupported languages.
- ElevenLabs speech synthesis, voice replies and streaming voice agent where WhatsApp calling eligibility permits.
- Outbound Meta messaging templates, opt-in, 24-hour customer service window, billing and delivery receipts.
- Per-tenant quotas, metering, abuse protection and deletion/export controls.

## Release gates
Run CI, apply migration 0008 once to existing D1 (fresh bootstrap is only for empty D1), set secrets, verify Meta webhook challenge, test signed sample events and confirm cross-tenant isolation. Do not claim global WhatsApp calling or ElevenLabs audio conversion is live until separately integrated and tested.

**Deployment remains blocked** until a real D1 database UUID replaces the placeholder and the release workflow succeeds.
