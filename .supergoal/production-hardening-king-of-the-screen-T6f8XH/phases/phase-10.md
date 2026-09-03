SUPERGOAL_PHASE_START
Phase: 10 of 16 — Rebuild reward processing
Task: Replace JSONL reward handling with durable jobs, leases, retries, and verified manual $KOTS purchase and delivery proofs.
Type: brownfield, backend, worker, rewards, security, admin
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run build, cd web && npm run test:e2e
Acceptance criteria: 10
Evidence required: job idempotency test, worker crash test, on-chain proof fixture matrix, static no-auto-buy proof, reward admin E2E
Depends on phases: 4, 7, 8

## Why

Rewards need a durable and truthful workflow that survives crashes and cannot be marked delivered without matching on-chain proof.

## Work

- Consume the phase 7 transactional outbox with an idempotent dispatcher and create one durable `$KOTS` reward job per eligible reign under a unique `(reign_id, reward_type)` constraint.
- Replace JSONL queue and processed files with repository-backed jobs, immutable attempt records, bounded leases, heartbeat or lease expiry, exponential backoff with jitter, maximum attempts, terminal dead-letter state, and authenticated replay.
- Define a manual `$KOTS` state machine: `awaiting_purchase_proof`, `purchase_verified`, `awaiting_delivery_proof`, `delivered`, plus explicit `retryable_failure`, `dead_letter`, and `cancelled` paths. Reject transitions not present in a single transition table.
- Keep market purchase and token transfer execution outside the application. The admin workflow records transaction signatures; the server performs read-only RPC verification and never constructs, signs, submits, or simulates a `$KOTS` swap or transfer.
- Verify purchase proof against the configured mainnet genesis, finality, `meta.err`, configured token mint, configured hot-wallet token account ownership, positive token balance delta, uniqueness, and reasonable job time window. Persist the actual acquired base units and decimals from chain data.
- Verify delivery proof against mainnet finality, `meta.err`, configured mint, a source token account owned by the configured hot wallet, a destination token account owned by the intent-bound reward wallet, exact allocated base units, uniqueness, and job time window.
- Require both verified proof records before `delivered`. Store each full signature only in the server database under a unique constraint so it can be re-queried and cannot be reused. Expose only a redacted reference alongside provider-neutral parsed evidence, RPC slot and block time, and verification version; never log wallet keys or RPC credentials.
- Handle duplicate submissions and worker restarts idempotently. Resolve ambiguous RPC timeouts by querying existing proof and signature state before another attempt changes the job.
- Protect every reward read and mutation with phase 8 authorization and CSRF controls. Require a bounded operator note for proof submission, cancellation, dead-letter replay, and allocation adjustment; write append-only audit events.
- Replace public and admin status text with states supported by stored evidence. Never display `sent`, `delivered`, an amount, or an automatic-airdrop claim until the corresponding verified proof exists.

## Acceptance criteria (all must pass — verify each in transcript)

- [ ] AC10.1: Dispatching the same `reign.created` outbox event repeatedly and after database reopen creates exactly one `$KOTS` reward job and marks the outbox event consumed once without dropping it on an injected failure.
- [ ] AC10.2: Table-driven tests cover every allowed reward transition and prove every unlisted transition returns a typed conflict without changing job, attempt, proof, or audit rows.
- [ ] AC10.3: A production-code scan plus worker tests prove the `$KOTS` path contains no swap construction, private-key loading, transaction signing, token-transfer construction, or RPC submission call.
- [ ] AC10.4: Purchase-proof fixtures accept only a finalized successful mainnet transaction that increases the configured mint balance of the configured hot-wallet-owned token account; wrong cluster, mint, owner, failed transaction, zero delta, stale time, and duplicate signature are rejected.
- [ ] AC10.5: Delivery-proof fixtures accept only a finalized successful mainnet transfer of the exact allocated base units from a hot-wallet-owned source to a token account owned by the intent-bound reward wallet; every mismatched field and duplicate signature is rejected.
- [ ] AC10.6: Tests prove a job cannot enter `delivered` without both verified proofs and that its displayed token amount equals the parsed on-chain base units converted with the verified mint decimals.
- [ ] AC10.7: A crash test acquires a job lease, stops before completion, advances the clock past lease expiry, starts a second worker, and proves exactly one terminal result with immutable attempt history and no duplicate proof.
- [ ] AC10.8: Retry tests prove transient RPC errors use bounded exponential backoff, the maximum attempt moves the job to `dead_letter`, and an authenticated replay creates a new attempt without deleting prior failure evidence.
- [ ] AC10.9: Reward API tests prove unauthenticated, non-CSRF, missing-note, and invalid-transition requests make no writes, while an authorized proof action creates one redacted audit row without keys, credentials, cookies, CSRF tokens, or full signatures.
- [ ] AC10.10: Reward admin E2E walks a job from awaiting purchase through verified delivery with mocked read-only chain fixtures, proves each truthful status label, and asserts paid takeover remains disabled and no automatic purchase or transfer is requested.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run build`
- `cd web && npm run test:e2e`

## Evidence required in transcript

- Show database counts from the repeated outbox dispatch and reopen test.
- Show the full allowed-transition test matrix and representative rejected transitions.
- Show zero-match static scan results for automated `$KOTS` purchase, signing, or transfer code, scoped so NFT minting code does not create a false result.
- Show purchase and delivery fixture matrices with each rejected reason and the accepted parsed base-unit values.
- Show the worker lease, crash recovery, retry, dead-letter, and replay test output with exit code 0.
- Show the reward admin E2E summary and screenshots of proof-required and delivered states with signatures redacted.
- Print a criterion table for AC10.1 through AC10.10 with `pass` and one concrete file, query, fixture, or test reference per row.

## Notes

This phase must not automate a Pump.fun or DEX purchase. It must not transfer `$KOTS`. It verifies operator-supplied on-chain proofs and records actual results. Keep paid takeover disabled throughout implementation and E2E.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
