# Milestone 47D — Cloudflare Cron and supervised WhatsApp reply drafts

## Committed
- Worker `scheduled()` event and a five-minute Cloudflare Cron trigger in `wrangler.jsonc`.
- Cron is **disabled by default** via `VOICE_CRON_ENABLED="false"`. When deliberately enabled, it enqueues consented audio and drains up to `VOICE_CRON_BATCH_SIZE` jobs (capped at five) per invocation.
- Protected internal reply endpoints: `GET/POST /api/voice/reviews` and `POST /api/voice/reviews/decision`.
- Draft creation validates the inbound message belongs to the requested tenant; review transitions pending drafts to approved/rejected without sending messages.
- New SQLite-backed review tests and Cron safety tests.

## Security and operations
Set `VOICE_REVIEW_TOKEN` as a separate, high-entropy Worker secret. It must be restricted to trusted backend operators, never exposed to the frontend. The `reviewer_subject` is an **operator-supplied audit label**, not independently verified OneLink identity. Do not expose this endpoint to untrusted tenants or use it as a public approval interface until a proper OneLink role/tenant authorization layer is built.

The Cron toggle must stay false until Meta credentials, ElevenLabs credentials, D1 migrations, sender consent, quotas, provider billing, deletion/retention processes, and end-to-end tests are ready. Voice notes are processed without sending outbound messages.

## Outstanding before live global messaging
- True OneLink-authenticated tenant reviewer UI with RBAC and immutable audit.
- WhatsApp outbound Meta Graph sending with delivery webhooks, explicit opt-in, 24-hour service-window enforcement, approved templates and idempotency.
- ElevenLabs speech synthesis, streaming calls only in eligible regions, provider usage and Paystack billing.
- Reliable dead-letter management and operational monitoring.
- Real D1 UUID and migration/deployment verification.

**No live WhatsApp replies, calls, or production deployment are claimed.**
