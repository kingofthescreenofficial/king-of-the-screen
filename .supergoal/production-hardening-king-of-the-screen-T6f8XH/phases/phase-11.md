SUPERGOAL_PHASE_START
Phase: 11 of 16 — Stabilize NFT issuance
Task: Issue one idempotent commemorative NFT per eligible reign through durable jobs, immutable metadata, and reconciled on-chain confirmation.
Type: brownfield, backend, worker, nft, solana, security, ui
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run build, cd web && npm run test:e2e
Acceptance criteria: 10
Evidence required: metadata snapshot proof, mint idempotency test, ambiguous-confirmation recovery test, key-boundary scan, NFT UI E2E
Depends on phases: 4, 7, 10

## Why

NFT minting must survive retries without duplicate collectibles and must not claim success until immutable metadata and the intended on-chain ownership are verified.

## Work

- Create one durable NFT job per eligible reign through the same transactional outbox pattern, enforced by unique `(reign_id, reward_type)` and unique mint-address constraints.
- Replace JSONL processed markers with persisted states such as `queued`, `publishing_metadata`, `ready_to_mint`, `submitting`, `confirming`, `minted`, `retryable_failure`, and `dead_letter`, using the phase 10 lease, attempt, retry, and audited replay primitives.
- Generate a canonical metadata snapshot from the immutable reign and approved content revision. Freeze name, description, attributes, recipient wallet, reign identifiers, image digest, policy version, and canonical edition wording once per job.
- Remove conflicting `1 of 25` and `1 of 100` claims plus the unimplemented 5% royalty claim. Describe the asset truthfully as one commemorative NFT for its specific reign unless separately persisted and on-chain-verified collection or royalty policy supplies those facts.
- Add a metadata publisher adapter that returns a content-addressed immutable URI and digest. Reject mutable HTTP metadata for mint submission. Keep jobs in `publishing_metadata` or a typed failure state when the publisher is unavailable.
- Use a maintained Solana and token-metadata client behind narrow adapters. Build, sign, and submit only in the dedicated NFT worker process, never in a Next.js route or browser bundle.
- Keep `NFT_WORKER_ENABLED=false` by default until phase 14 provisions a dedicated mint authority and least-privilege key source. Restrict worker key access to that server-only source, validate that its public address matches the expected authority, and redact key material, signed transactions, RPC credentials, and complete signatures from logs and errors.
- Reconcile every ambiguous submission before retry: query the recorded signature, expected mint address, metadata PDA, and recipient token account. Adopt an already-confirmed matching mint; refuse a second mint if ownership or metadata conflicts.
- Mark `minted` only after finalized chain verification proves successful execution, the expected mint and metadata URI, configured creator or authority, supply and decimals consistent with an NFT, and ownership by the intent-bound reward wallet. Persist the full transaction signature server-side under a unique constraint with parsed proof, slot, block time, and mint address; expose and log only a redacted signature reference.
- Serve NFT API and UI state from the durable snapshot and proof records. Show queued, retrying, needs-attention, and minted states accurately; expose mint links only after proof and keep paid takeover disabled.

## Acceptance criteria (all must pass — verify each in transcript)

- [ ] AC11.1: Replaying the same reign outbox event before and after database reopen creates exactly one NFT job, one metadata snapshot, and at most one mint address.
- [ ] AC11.2: Snapshot and rendered-copy tests prove metadata is deterministic for a fixed reign, includes the approved content digest and recipient wallet, remains unchanged when current king or global counters change, and contains no `1 of 25`, `1 of 100`, or 5% royalty claim without matching persisted and on-chain-verified policy.
- [ ] AC11.3: Metadata-publisher tests accept a content-addressed immutable URI only when the returned digest matches the canonical bytes; mutable HTTP URI, digest mismatch, timeout, and unavailable provider prevent transition to `ready_to_mint`.
- [ ] AC11.4: A code-boundary test and bundle scan prove NFT signing and submission are importable only by the dedicated worker and absent from Next.js route handlers, client modules, and browser output.
- [ ] AC11.5: With the default worker flag or without a provisioned dedicated authority, the worker performs zero signing or submission calls; key-source tests also reject absent, world-readable, malformed, or wrong-authority credentials before construction and prove logs and errors contain no private key bytes, seed material, RPC credential, or full signed transaction.
- [ ] AC11.6: Running two workers against one queued job produces one lease owner, one submitted mint operation, and one immutable attempt sequence under the unique job and mint constraints.
- [ ] AC11.7: Ambiguous-confirmation tests cover RPC timeout before and after landing; the reconciler adopts one matching finalized mint and refuses a conflicting mint or metadata account without submitting a duplicate.
- [ ] AC11.8: Finalization fixtures prove `minted` requires a successful finalized transaction, expected mint, immutable metadata URI, configured authority or creator, supply one, decimals zero, and ownership by the intent-bound reward wallet; each mismatch leaves the job non-minted.
- [ ] AC11.9: Retry and authenticated replay tests prove transient failures back off, terminal failures enter `dead_letter`, prior attempts remain immutable, and replay requires admin session, CSRF token, bounded reason, and one redacted audit event.
- [ ] AC11.10: NFT API and browser E2E show truthful queued, retrying, needs-attention, and proven-minted states from fixtures, expose an explorer link only for the proven mint, and assert paid takeover remains disabled.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run build`
- `cd web && npm run test:e2e`

## Evidence required in transcript

- Show canonical metadata output with user text shortened and wallets or signatures redacted, plus its stable digest across the snapshot test.
- Show the immutable-URI fixture matrix and transition results.
- Show the worker-only import and browser-bundle scan results.
- Show the two-worker idempotency row counts and the ambiguous-confirmation reconciliation test output.
- Show a finalization fixture matrix with every required field and representative rejection reasons.
- Show the NFT E2E summary and screenshots for a non-final state and a proven-minted state.
- Print a criterion table for AC11.1 through AC11.10 with `pass` and one concrete file, query, fixture, or test reference per row.

## Notes

Do not send a mainnet mint during automated tests. Use deterministic adapters and recorded sanitized fixtures. A production worker stays off until phase 14 has installed a dedicated mint authority with least-privilege key access and the job has a valid intent-bound recipient. Never claim immutable metadata when the configured publisher did not return a verified content-addressed URI.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
