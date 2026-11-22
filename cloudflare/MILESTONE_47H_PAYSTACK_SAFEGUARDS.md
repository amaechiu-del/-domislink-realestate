# Milestone 47H — Cross-channel send safety and Paystack verification

## Implemented
- Migration 0014 adds a single unique send reservation per approved draft across text/audio channels, a Paystack payment ledger and an append-only contact-consent event table.
- Both text and audio senders use `reserveSend` before contacting Meta. This eliminates the previous text-versus-audio simultaneous-claim race.
- `POST /api/communications/paystack/verify` requires an internal `COMMUNICATIONS_BILLING_TOKEN`, verifies a pre-registered payment reference server-to-server with Paystack, and matches successful status, amount in kobo, currency and reference. Verified payments are recorded idempotently.
- Integration tests cover cross-channel duplicate prevention, rejected mismatched payments and verified payments.

## Safety
Outbound and voice sends remain disabled unless explicitly enabled with secrets. A verified one-off payment does **not** activate a recurring subscription: plan entitlement activation needs a verified subscription plan, duration and provider lifecycle state. Do not grant unlimited voice usage from a one-off transaction.

## Outstanding
- Secure, owner-authenticated payment initialization and Paystack subscription lifecycle webhooks with entitlement fulfillment.
- Customer consent UI with identity proof and audit event writes (table exists only).
- Meta-approved template sync and sending (table exists only).
- Accurate provider usage, quota reservation under concurrency, retention cleanup and billing reconciliation.
- Cloudflare production configuration, migration application and live Meta/Paystack acceptance.

Do not turn on outbound flags until these release gates are complete.
