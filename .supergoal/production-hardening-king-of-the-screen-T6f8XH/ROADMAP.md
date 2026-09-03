# Roadmap: King of the Screen production hardening

**Task:** Complete the code, data, security and deployment work needed for a payment-paused production release.
**Type:** brownfield, security, refactor, payments, operations, ui
**Created:** 2026-09-03
**Total phases:** 16

## Context summary

- **Stack:** Next.js 15, React 19, TypeScript, Solana Web3.js, PM2, Nginx
- **Package manager:** npm in `web/`
- **Build / test / lint commands:** `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:coverage`, `npm run test:e2e`
- **Risky areas:** payment verification, public telemetry, admin access, file-backed state, reward worker, root VPS services

## Assumptions

- SQLite WAL is the first durable database because production is single-node and memory-constrained. Repositories and migrations keep a later PostgreSQL move bounded.
- Paid takeover stays disabled through this run and deployment. Legal approval and explicit owner activation come later.
- Checkout uses a short exclusive reservation plus wallet proof. Late valid payments enter recovery instead of disappearing.
- $KOTS fulfillment remains a verified manual workflow until the legal review permits automation.
- Existing visual identity stays. The client refactor targets clarity, honesty, responsive behavior and accessibility.
- Production activation requires a tested off-host backup target or verified provider snapshot policy.

## Risk top 3

1. **Invalid or stolen payment acceptance** — likelihood: high, mitigation: server intents, exact Solana checks, memo binding and durable replay protection.
2. **Data loss or inconsistent crown state** — likelihood: high, mitigation: transactional storage, price-version compare-and-swap, recovery jobs and restore tests.
3. **VPS or secret compromise** — likelihood: high, mitigation: credential rotation, non-root services, key-only SSH, firewall, loopback binding and least-privilege files.

## Phase map

| # | Phase | Depends on | Deliverable |
|---|-------|------------|-------------|
| 1 | Establish engineering baseline | — | Deterministic lint, typecheck, unit, integration, E2E and CI commands |
| 2 | Freeze unsafe surfaces | 1 | Payment-off kill switch, closed attack paths and an emergency safety release |
| 3 | Simplify dependency surface | 1, 2 | Minimal wallet bundle, clean lockfile and no critical/high production advisories |
| 4 | Build durable persistence | 1, 2 | SQLite schema, repositories, migrations and legacy-state import |
| 5 | Create payment intents | 4 | Wallet-authenticated quote and reservation protocol |
| 6 | Verify Solana payments | 5 | Exact, fixture-tested on-chain transaction verification |
| 7 | Enforce auction consistency | 4, 5, 6 | Atomic settlement, idempotency and paid-transaction recovery |
| 8 | Secure administrative access | 4, 7 | Server sessions, CSRF, audit log and protected controls |
| 9 | Harden content ingestion | 4, 5, 8 | Premoderated, bounded and safely rendered content pipeline |
| 10 | Rebuild reward processing | 4, 7, 8 | Durable, retryable and proof-backed reward jobs |
| 11 | Stabilize NFT issuance | 4, 7, 10 | Idempotent NFT mint records, retries and verified metadata |
| 12 | Refactor client experience | 2, 5, 7, 9, 10, 11 | Smaller components and truthful accessible user states |
| 13 | Package production operations | 3, 4, 8, 10, 11, 12 | Repeatable service, Nginx, env, backup and rollback assets |
| 14 | Stage VPS hardening | 13 | Backed-up server foundation, restricted network and staged non-root service migration |
| 15 | Deploy paused release | 14 | Backed-up, smoke-tested non-root production release with payments disabled |
| 16 | Polish & Harden | 1–15 | Full regression, security, accessibility, performance and restore evidence |

## Phase contracts

Every phase has a detailed work spec under `phases/phase-N.md`. A phase is complete only when every listed criterion passes, all mandatory commands exit zero and the required evidence is recorded. The final audit re-runs the aggregate gates against this roadmap.

## Production release boundary

Phase 15 deploys the hardened application with paid takeover disabled. This satisfies the code portion of the parent goal without accepting new funds before legal review. The later legal work must resolve disclosures, entity and jurisdiction choices, sanctions and consumer-process requirements. Only then can the owner approve payment activation.

## Self-critique

- Falsifiability: one phase 13 criterion was rewritten from a vague backup statement to an artifact-plus-restore check.
- Phase atomicity: phases 14 and 15 both touch production, but they have separate gates. Phase 14 hardens the server, phase 15 deploys the app.
- Weakest dependency: phase 4 is the main cascade risk because payment, admin, reward and NFT flows all depend on storage correctness.
