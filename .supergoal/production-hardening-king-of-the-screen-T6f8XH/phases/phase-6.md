SUPERGOAL_PHASE_START
Phase: 6 of 16 — Verify Solana payments
Task: Parse confirmed Solana transactions and accept only exact intent-bound two-recipient payments.
Type: brownfield, payments, security
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run build
Acceptance criteria: 12
Evidence required: verifier fixtures, rejection matrix, command summaries
Depends on phases: 5

## Why

Balance-change checks and client-supplied totals cannot protect an irreversible payment flow.

## Work

- Build a pure verifier that accepts an RPC transaction response plus stored intent.
- Check finalized commitment, no transaction error, expected fee payer, block time window and exact signature format.
- Verify memo contains the stored intent id or nonce.
- Verify exactly the expected SOL transfers to treasury and hot wallet in lamports.
- Allow only the declared compute-budget instructions, two top-level System Program transfers and the Memo Program instruction. Reject any other value-moving instruction, extra transfer, recipient or memo.
- Reject wrong sender, wrong recipient, underpayment, overpayment policy violations, missing hot transfer, replay, stale intent and failed transaction.
- Persist verification result without logging sensitive raw transaction bodies.
- Add fixture tests for every acceptance and rejection case.
- Remove EVM hash acceptance path unless it is fully verified and in active product scope.

## Acceptance criteria (all must pass — verify each in transcript)

- Valid fixture with exact treasury and hot-wallet transfers passes.
- Underpaid treasury transfer fails.
- Missing hot-wallet transfer fails.
- Wrong buyer fee payer fails.
- Wrong memo or missing intent id fails.
- Transaction with `meta.err` fails.
- A merely confirmed but not finalized transaction fails.
- A transaction with an extra transfer, an inner value movement or an undeclared program instruction fails.
- Stale or expired block time fails.
- Replayed signature fails through durable uniqueness.
- EVM placeholder acceptance is removed or returns unsupported.
- Verifier has deterministic unit coverage without live RPC.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run build`

## Evidence required in transcript

- Rejection matrix table with pass/fail counts.
- Fixture names and coverage summary.
- Grep result proving balance-only verification no longer exists in settlement code.

## Notes

Keep RPC calls thin. The core verifier must stay pure and fixture-testable.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
