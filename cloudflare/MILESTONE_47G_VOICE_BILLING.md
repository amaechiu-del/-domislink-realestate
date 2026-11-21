# Milestone 47G — WhatsApp voice delivery and communications billing foundation

## Built
- Migration `0013_whatsapp_voice_billing.sql`: template registry, usage ledger, voice-send reservations, tenant communication plan records with Paystack customer/subscription references.
- `POST /api/whatsapp/send-approved-voice`: restricted internal endpoint, disabled unless `WHATSAPP_VOICE_OUTBOUND_ENABLED=true`. Requires approved draft, contact text + voice opt-in, active subscription record, remaining voice allowance and a Meta inbound timestamp inside 24 hours. Generates ElevenLabs MP3, uploads to Meta media, sends WhatsApp audio, records delivery ID and estimated voice usage.
- Unknown network/provider outcomes are held for manual reconciliation. A duplicate send of the same draft is blocked; text and voice send reservations are checked across channels.
- `GET /api/communications/billing?tenant_id=...`: internal, tenant-scoped plan, monthly usage and registered Meta template status.
- Automated tests for disabled-by-default behavior, consent revocation, quotas, idempotency, mock media upload and provider response.

## Required secrets
`WHATSAPP_VOICE_SEND_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `COMMUNICATIONS_BILLING_TOKEN`. The optional `ELEVENLABS_TTS_MODEL` is supported.

## Important limitations
- Paystack integration is **schema and reporting foundation only**. No new Paystack checkout, subscription activation or verified webhook fulfillment has been implemented in this milestone. Never mark a billing plan active based on client-submitted payment status.
- The template registry records approval metadata but **does not verify Meta template approvals or send templates**.
- Usage is **estimated** from character count, not provider-verified audio duration or invoiceable provider usage. Final billing requires reconciliation.
- The voice send path uploads MP3; Meta account and media format compatibility must be verified in sandbox. Audio is not persisted in R2 by this path.
- Consent is stored but no public opt-in/withdrawal interface exists yet.
- A single draft can be reserved for both channels in a near-simultaneous race because the current cross-channel checks are not transactional. Keep both outbound flags disabled until a unified atomic send reservation is added.
- No production deployment is verified. D1 UUID is still a placeholder.

## Release gates
Backup D1, apply migration 0013 to existing databases once, configure provider secrets, verify actual Meta audio sending, set up consent and retention, implement atomic cross-channel reservation, add Paystack server-verified subscription fulfillment and reconciliation, then explicitly enable outbound flags.
