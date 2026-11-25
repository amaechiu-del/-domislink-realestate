# Milestone 36 — OneLink and Paystack sandbox acceptance

## Advertiser journey
1. Open the marketplace and sign in through OneLink. Confirm the callback establishes an authenticated session.
2. Create an advertisement draft and confirm that only its owner can edit it.
3. Start checkout with a Paystack **test** key. The server must calculate the charge.
4. Complete a sandbox payment and return to `/onelink/payment-return?reference=...`.
5. Select **Verify payment**. Publication must occur only after server-side Paystack verification.
6. Visit **My advertisements** and confirm the listing is published exactly once.
7. Retry the webhook and verify no duplicate commission entries.
8. Simulate failed and unresolved payments. Use **Check payment status** and ensure unresolved transactions do not offer another charge.
9. Verify that an unexpectedly late success after a released failed reservation is held for manual reconciliation.

## Environment gates
- Cloudflare D1 database ID is real, schema and migrations applied, Worker `/api/ready` returns 200.
- Worker `ONELINK_AUDIENCE`, `ONELINK_ISSUER`, and `PAYSTACK_SECRET_KEY` are configured.
- Next.js `DOMISLINKER_API_URL`, `ONELINK_SESSION_KEY`, and OIDC client/callback settings are configured.
- Paystack callback and signed webhook point to the correct frontend and Worker endpoints.
- GitHub verification and deployment smoke checks pass.

## Evidence required
Record the deployed frontend origin, Worker origin, D1 database name (not secrets), OneLink login outcome, Paystack test reference, webhook delivery status, published listing ID, and commission ledger outcome. Do not mark live payments enabled on the basis of CI alone.
