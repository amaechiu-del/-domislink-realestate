# Milestone 47B — Global multilingual voice processing

## Implemented
- `/api/voice/process` is an **internal** Bearer-token-protected endpoint for one inbound WhatsApp voice note by D1 UUID.
- Looks up the WhatsApp phone number → tenant, requires an enabled tenant route, enabled voice settings, transcription setting and explicit sender consent before any provider download.
- Downloads audio from Meta Graph, restricts the media host and file size, transcribes with ElevenLabs Speech-to-Text, optionally calls an allowlisted translation provider.
- Saves the transcript, detected language, optional translation, processing state and per-tenant quota usage in D1.
- `/api/voice/readiness` reports configured provider presence only, never secret values.
- New D1 migration `0009_whatsapp_voice_processing.sql` and automated adapter/security tests.

## Cloudflare Worker secrets
- `VOICE_PROCESSOR_TOKEN`: high-entropy internal token; never expose in browser or client app.
- `WHATSAPP_ACCESS_TOKEN`: Meta Graph API credential with permission for approved WhatsApp media.
- `ELEVENLABS_API_KEY`: ElevenLabs Speech-to-Text API key.
- Optional `ELEVENLABS_STT_MODEL` Worker var (defaults to `scribe_v1`).
- Optional `VOICE_TRANSLATION_ENDPOINT`, `VOICE_TRANSLATION_ALLOWED_HOST`, `VOICE_TRANSLATION_TOKEN` for an approved translation service returning `{translation: string}`.

## Operations
1. Apply migration 0009 **once** after backing up an existing D1 database. Fresh bootstrap is only for an empty database.
2. Register the WhatsApp business phone to a tenant in `whatsapp_tenant_routes`, then enable it.
3. Add an explicit row in `whatsapp_voice_settings` for that tenant; `enabled` and `transcription_enabled` must both be 1.
4. Record affirmative sender consent in `whatsapp_voice_consents` (`voice_processing=1`); revocation must disable processing.
5. Use an authenticated backend job/queue to invoke `POST /api/voice/process` with `{inbound_id: "<UUID>"}`. The webhook does not automatically start audio processing.
6. Configure consent notices, retention/deletion jobs, quota billing and audit before live operation.

## Not yet enabled
- AI-generated WhatsApp replies, Meta-approved template sending, human escalation UI, voice synthesis, live calls and streaming conversations.
- Automated queue scheduling and retries. A stuck `queued` event requires supervised recovery.
- Precise audio duration metering: currently a conservative 60-second quota unit per note.
- Translation provider is a configurable adapter, not a built-in translation service.

**Production is not yet verified.** Deploy only after successful CI, valid Cloudflare D1 binding, Meta/ElevenLabs secrets, user consent and provider sandbox acceptance.
