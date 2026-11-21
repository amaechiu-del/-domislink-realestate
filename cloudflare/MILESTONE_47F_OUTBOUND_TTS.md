# Milestone 47F — Controlled WhatsApp outbound and ElevenLabs synthesis

## Implemented
- `0012_whatsapp_outbound_controls.sql`: provider inbound timestamps, tenant contact opt-in, voice opt-in and unique send reservations.
- Signed Meta inbound webhook now preserves the provider timestamp used to determine the 24-hour WhatsApp customer-service window.
- `POST /api/whatsapp/send-approved`: internal-only token, explicit outbound opt-in, approved human-reviewed draft, active 24-hour customer service window, tenant number match and idempotent reservation. Provider HTTP/network uncertainty is recorded for manual reconciliation, **not automatically retried**.
- On confirmed provider send, the sender records the provider message ID in the existing delivery ledger, enabling signed Meta status updates.
- `cloudflare/elevenlabs-tts.js`: multilingual ElevenLabs text-to-speech adapter with bounded input/output and secret-only API credentials. **Audio is not sent to WhatsApp.**
- Integration tests for consent, expiry, duplicate sends, disabled-by-default operation and TTS response validation.

## Secrets and flags
- `WHATSAPP_SEND_TOKEN`: internal backend token, separate from the review token.
- `WHATSAPP_ACCESS_TOKEN`: approved Meta Graph token.
- `WHATSAPP_OUTBOUND_ENABLED`: must be explicitly `true`; default is disabled.
- `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`; optional `ELEVENLABS_TTS_MODEL` (defaults to `eleven_multilingual_v2`).

## Release constraints
1. Apply migration 0012 after D1 backup, then verify signed Meta inbound timestamps.
2. Record consent from a verified opt-in flow; there is no public opt-in management API.
3. Confirm approved draft and tenant ownership via OneLink before an authorized backend invokes the internal send endpoint. Do not expose the internal send token in the browser.
4. Meta-approved template sending is **not implemented**. Outside the 24-hour customer-service window, sending is denied.
5. Reconcile `unknown` sends manually against Meta before any reattempt. No automatic retries of ambiguous provider responses.
6. ElevenLabs TTS remains an adapter only; media upload, WhatsApp audio send, quota billing and retention are future tasks.

**Deployment remains unverified** until the real Cloudflare D1 UUID, secrets, migrations and live Meta/ElevenLabs acceptance tests are complete.
