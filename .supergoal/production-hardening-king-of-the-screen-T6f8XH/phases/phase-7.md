SUPERGOAL_PHASE_START
Phase: 7 of 16 — Enforce auction consistency
Task: Settle verified payment intents atomically and recover every valid but unsettled payment without enabling checkout.
Type: brownfield, backend, payments, security, data
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run build
Acceptance criteria: 10
Evidence required: atomic rollback test, concurrent settlement test, restart replay test, late-payment recovery test, payment-off proof
Depends on phases: 4, 5, 6

## Why

An irreversible Solana transfer must produce one durable result even when confirmations race, requests repeat, or the process stops between writes.

## Work

- Add an application-level settlement service that accepts only a verified result from the phase 6 verifier plus the corresponding persisted intent ID. Do not accept client price, split, wallet, finality, or timing claims.
- Execute payment insertion, intent consumption, auction compare-and-swap, reign creation, state/stat updates, and durable outbox insertion inside one SQLite immediate transaction.
- Use the intent `price_version` and the current auction row as the compare-and-swap boundary. Derive the next minimum price and aggregate statistics on the server with integer-safe monetary values.
- Make transaction signature, intent ID, reign ID, and outbox event uniqueness durable. Replaying a completed confirmation must return the original settlement result without inserting another row or changing totals.
- Define deterministic concurrent-settlement behavior. Exactly one transaction against a price version can become king. Any other verified transfer must be persisted as a recovery case rather than discarded.
- Distinguish transaction landing time from API receipt time. A transaction landed within its signed intent window remains eligible when confirmation arrives later. A transaction landed after the window must enter recovery and cannot crown automatically.
- Add a recovery state machine with explicit reasons such as `stale_price_version`, `late_payment`, `ambiguous_confirmation`, and `settlement_error`. Support audited operator resolutions `settled`, `credited`, and `refunded`; expose no public mutation route in this phase.
- Add a reconciliation service that finds verified payments lacking a final settlement or recovery resolution and safely resumes them after restart.
- Emit a durable `reign.created` outbox record in the crown transaction so later reward phases can create jobs without coupling payment settlement to an external worker.
- Keep `PAID_TAKEOVER_ENABLED=false` as the production default. Tests may call domain services directly or use an explicit test-only configuration, never a production fallback.

## Acceptance criteria (all must pass — verify each in transcript)

- [ ] AC7.1: An integration test injects a failure after payment insertion and proves that the payment, intent status, auction row, reign, statistics, and outbox all remain unchanged after rollback.
- [ ] AC7.2: A successful settlement test proves that one database transaction persists exactly one payment, consumes exactly one intent, advances exactly one auction `price_version`, creates exactly one reign, and creates exactly one `reign.created` outbox event.
- [ ] AC7.3: A two-client concurrency test starts both settlements from the same `price_version` and proves exactly one becomes king while the other verified transfer is stored once in recovery with reason `stale_price_version`.
- [ ] AC7.4: Repeating the same intent and signature before and after closing and reopening the database returns the same settlement identifier and leaves reign, outbox, totals, and recovery row counts unchanged.
- [ ] AC7.5: Tests prove a transaction whose on-chain landing time is within the intent window can settle after API expiry, while a transaction landed after that window creates one `late_payment` recovery row and does not alter the king.
- [ ] AC7.6: A test submits forged client USD and SOL totals and proves the settlement uses only the persisted server intent, the verified lamport split, and the server price rule.
- [ ] AC7.7: Every recovery row contains a unique payment reference, reason code, created time, current status, and append-only resolution history; invalid or repeated state transitions return a typed conflict and make no write.
- [ ] AC7.8: A restart reconciliation test leaves a verified payment without a terminal outcome, runs the reconciler twice, and proves it reaches one terminal settlement or recovery result without duplicate reigns or events.
- [ ] AC7.9: With `PAID_TAKEOVER_ENABLED=false`, public intent confirmation returns the documented unavailable response before RPC or settlement calls and database counts remain unchanged.
- [ ] AC7.10: Tests prove no reward delivery or NFT network call runs inside the settlement transaction; only the durable outbox event is produced.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run build`

## Evidence required in transcript

- Name the settlement service and repository transaction boundary, then show the focused rollback test with exit code 0.
- Show the two-client concurrency test output and database row counts for winner, recovery case, reign, and outbox.
- Show the replay-after-reopen test output and the unchanged unique row counts.
- Show both landing-time cases and their distinct terminal states.
- Show the payment-off route test proving zero RPC calls and zero writes.
- Print a criterion table for AC7.1 through AC7.10 with `pass` and one concrete file, query, or test reference per row.

## Notes

Do not compensate a paid user automatically. Recovery resolution records the operator decision and proof reference; actual refund or credit execution stays behind the authenticated admin workflow from phase 8. Do not enable paid takeover in any environment used for deployment.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
