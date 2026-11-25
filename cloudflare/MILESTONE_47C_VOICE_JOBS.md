# Milestone 47C — durable voice queue and supervised reply foundation

## Implemented
- `0010_whatsapp_voice_jobs.sql` adds lease-based durable voice jobs and private human-reviewed reply draft storage.
- `POST /api/voice/jobs/enqueue` scans at most 100 eligible received voice notes and enqueues only when the tenant is enabled and the sender has explicit voice-processing consent.
- `POST /api/voice/jobs/drain` claims one due job, calls the existing ElevenLabs/Meta voice processor, marks success or schedules bounded retries (three attempts, then dead-letter).
- Both endpoints require `VOICE_PROCESSOR_TOKEN` and are **internal only**.
- SQLite integration tests cover consent, idempotency and unauthorized access.

## Operational constraints
These are manually invokable worker endpoints, **not yet a scheduled Cloudflare Cron or Queues consumer**. Do not expose the internal token to browsers, customers, or GitHub logs. A queue scheduler must be added and tested before calling this automatic processing.

No WhatsApp outbound sends, ElevenLabs voice synthesis, live calling, human approval API or Paystack voice billing have been enabled. The reply draft table is groundwork for a future review inbox.

Before production: configure D1 UUID, apply migration 0010 to existing database once, enable Meta and ElevenLabs credentials, confirm sender consent and retention controls, run sandbox voice acceptance, and add an authenticated scheduler/queue consumer.

## Next steps
1. Cloudflare Cron trigger or Queues worker for periodic enqueue/drain with concurrency protection.
2. Owner-only OneLink review inbox and audited approve/reject operations.
3. Meta send API with WhatsApp 24-hour session-window and opt-in/template enforcement.
4. ElevenLabs TTS voice reply option with usage metering, R2 retention and deletion.
5. Paystack subscription/wallet integration and human escalation routing.
