SUPERGOAL_PHASE_START
Phase: 5 of 16 — Create payment intents
Task: Add wallet-authenticated server quotes and exclusive reservations for future paid takeovers.
Type: brownfield, payments, backend
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run build
Acceptance criteria: 11
Evidence required: route contract, reservation tests, schema tests, command summaries
Depends on phases: 4

## Why

The server must define the exact payment before the wallet signs anything.

## Work

- Add wallet challenge creation and verification for reservation requests.
- Add `POST /api/payment-intents` or equivalent route behind `PAID_TAKEOVER_ENABLED`.
- Server computes USD price, SOL quote, total lamports, treasury lamports, hot-wallet lamports, nonce, expiry and price version from two server-side oracle adapters. Reject stale, unavailable or materially divergent quotes instead of using a browser fallback.
- Bind the intent to buyer wallet, reward wallet, content digest, accepted terms version and recipients.
- Enforce one active reservation per auction for at most 90 seconds, plus a maximum of three reservation attempts per wallet per 15-minute window and ten per network source per five-minute window.
- Return a server-built unsigned serialized legacy Solana transaction containing only declared compute-budget instructions, the exact two system transfers and the intent memo. The wallet signs it; the server submits or observes that signed transaction through its private RPC path.
- Add expiration and cancellation handling.
- Add tests for stale price, stale terms, wrong wallet, duplicate reservation and disabled payments.

## Acceptance criteria (all must pass — verify each in transcript)

- Intent creation requires a verified wallet challenge.
- Intent creation is rejected while paid takeover is disabled.
- Intent amounts are computed server-side from a fresh, non-divergent quote and stored in lamports.
- Treasury and hot-wallet amounts sum exactly to total lamports.
- Intent stores content digest and terms version.
- A second active reservation for the auction returns a documented conflict without replacing the existing reservation, and the original reservation expires after at most 90 seconds.
- Expired intents cannot be confirmed as active.
- The reservation route enforces three attempts per wallet per 15 minutes and ten attempts per network source per five minutes, with deterministic clock-controlled tests for both limits.
- The client receives no editable transfer plan: fixture tests prove it signs the server-built serialized transaction and cannot change recipient, lamports or memo.
- Route tests cover valid and invalid request bodies.
- Client no longer sends `paidAmountUsd` as an authority.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run build`

## Evidence required in transcript

- API contract examples for create, disabled, invalid wallet and expired cases.
- Database rows for one test intent with sensitive data redacted.
- Test summary for reservation rules.

## Notes

Do not enable production paid checkout. This phase builds the protocol under the paused gate.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
