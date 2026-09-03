SUPERGOAL_PHASE_START
Phase: 16 of 16 — Polish & Harden
Task: Run the final product, code, security, accessibility, performance, recovery and production regression pass while payments remain disabled.
Type: polish, ux, security, accessibility, performance, regression, operations
Mandatory commands: cd web && npm ci, cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run test:e2e, cd web && npm run test:a11y, cd web && npm run test:performance, cd web && npm run security:check, cd web && npm run build, cd web && npm audit --omit=dev --audit-level=high, cd web && npm run ops:smoke -- --origin=https://kingofthescreen.fun --expect-payments=disabled, ssh -o BatchMode=yes kots-production 'sudo -n /opt/kots/current/ops/backup/restore-drill.sh --latest --isolated --redacted', git diff --check
Acceptance criteria: 22
Evidence required: copy and state inventory, responsive screenshots, keyboard and axe results, Lighthouse and bundle reports, security route matrix, payment verifier corpus, coverage and E2E reports, dependency audit, final diff review, production smoke and logs, final backup restore comparison, disabled-payment launch gate proof
Depends on phases: 1–15

## Why

The final pass must prove that the complete system is clear to users, resistant to known abuse, operable after failure and still incapable of accepting payments before legal approval.

## Work

- Review every public and administrative surface at desktop and mobile sizes. Fix visual regressions, clipping, overflow, focus loss, broken empty states and inconsistent status language.
- Replace misleading live-viewer, automatic-buy, automatic-airdrop, profit, price-growth or guaranteed-outcome claims with descriptions that match the implemented and verified behavior.
- Keep a clear payment-paused state on all takeover entry points. Ensure no disabled control triggers wallet signing and no API path bypasses the flag.
- Build and test a state matrix for wallet unavailable, connection rejected, wrong network, quote loading, quote failure, stale quote, moderation rejection, invalid upload, reservation expiry, user transaction rejection, confirmation pending, late-payment recovery, reward pending, reward failure, NFT retry, unauthorized admin and service outage.
- Verify responsive layout at 320, 375, 768 and 1440 CSS pixels and with zoom at 200 percent. Keep primary content and controls visible without two-axis scrolling.
- Complete keyboard, focus, semantic landmark, accessible-name, validation-message and live-region behavior. Respect reduced motion and minimum contrast.
- Run automated accessibility scans on public, takeover, history, legal and admin-login views. Resolve every serious or critical axe finding and document any lower-impact exception.
- Run three consistent production-mode performance samples on the main public view. Remove avoidable client work and unused bundles while retaining wallet functionality.
- Review all public API routes, server actions and workers against authentication, authorization, CSRF, CORS, rate limits, schema validation, path handling, content type, error redaction and idempotency requirements.
- Re-run the adversarial Solana fixture corpus for underpayment, missing recipient, wrong sender, wrong split, wrong memo, stale intent, failed transaction, unconfirmed transaction, replay and concurrent settlement.
- Add boundary and malformed-input tests for uploads, URLs, wallet addresses, transaction signatures, pagination, admin actions and worker job payloads.
- Inspect the complete branch diff and generated artifact list. Remove debug output, stale scripts, dead dependencies, tracked caches, accidental secrets and unexplained production files.
- Confirm unit and integration coverage stays at or above 80 percent for statements, branches, functions and lines. Do not exclude payment, persistence, authentication or worker domains to inflate coverage.
- Run full local E2E and read-only production smoke coverage for public browsing, wallet connection without signing, disabled takeover, admin denial, authenticated read-only admin, content failure states and recovery visibility.
- Run the dependency audit and direct dependency inventory. Resolve every critical or high production advisory and remove unused broad wallet or blockchain packages.
- Re-run production host checks for service users, loopback binding, firewall, SSH, fail2ban, TLS, headers, disk space, timers and redacted logs.
- Create a fresh encrypted off-host backup from the final release and restore it into an isolated directory. Compare checksum, schema and core counts with the production database.
- Review the activation runbook and assert its gates include completed legal review, current disclosures, sanctions process, backup health and explicit owner approval. Leave activation unexecuted.

## Acceptance criteria (all must pass — verify each in transcript)

- Public and admin copy matches implemented behavior and contains no fabricated viewer count, automatic fulfillment claim, guaranteed result, profit promise or unverified market-support statement.
- Every takeover entry point visibly reports payments paused, disabled controls request no wallet signature and all server payment paths fail closed under `PAID_TAKEOVER_ENABLED=false`.
- Automated tests cover every state in the documented wallet, quote, moderation, reservation, transaction, recovery, reward, NFT, admin and outage state matrix, with no ambiguous spinner or success state.
- Screens at 320, 375, 768 and 1440 CSS pixels plus 200 percent zoom have no clipped primary control, overlapping text or unintended two-axis page scrolling.
- All user flows work by keyboard alone, focus order is logical, focus remains visible and each modal returns focus to its opener.
- Landmarks, headings, labels, validation errors, status updates and icon controls have correct semantics and accessible names, and reduced-motion preference disables nonessential motion.
- Automated accessibility scans report zero serious or critical axe violations on the required routes and measured text plus control contrast meets WCAG AA.
- The median of three production-mode mobile performance runs reaches the recorded project budget, including Lighthouse performance at least 85, accessibility at least 95 and no regression above the approved JavaScript bundle budget.
- The security route matrix proves authentication, authorization, CSRF, CORS, rate limiting, schema validation, safe error responses and content-type handling for every mutable endpoint.
- The Solana verifier corpus rejects underpayment, missing hot-wallet transfer, wrong sender, wrong split, wrong memo, stale intent, failed or unconfirmed transaction and replay, while accepting only the exact valid fixture.
- Concurrent settlement tests preserve one authoritative crown, one use per intent and signature, deterministic price progression and a durable recovery record for each valid late payment.
- Malformed and boundary inputs for uploads, URLs, wallet addresses, signatures, pagination, admin actions and worker jobs return bounded errors without crashes, traversal, injection or persistent invalid state.
- Admin sessions expire and revoke correctly, CSRF tokens bind to sessions, rate limits survive concurrent requests and all unauthenticated administrative mutations return 401 or 403.
- Coverage is at least 80 percent for statements, branches, functions and lines, with payment, persistence, authentication and worker code included in the measured set.
- Full local E2E passes for public browsing, wallet connection without signing, disabled takeover, moderation failures, admin denial, authenticated read-only administration, reward states and payment recovery visibility.
- `npm audit --omit=dev --audit-level=high` exits zero, no unused broad wallet package remains and the release manifest records the final direct dependency set.
- The complete branch diff contains no secret, debug endpoint, hardcoded credential, tracked build cache, stale production patch, unexplained binary or unrelated user-file change.
- No unresolved P0 or P1 correctness, security, data-loss, accessibility or operations finding remains in the final review ledger.
- Production verification confirms direct `kots-web.service` and `kots-sentinel.service` processes under different non-root users with no PM2 parent, loopback-only application binding, closed public port 3000, key-only SSH, active firewall and fail2ban, valid TLS, approved headers, healthy timers and bounded disk use.
- Redacted production logs contain no secret, startup failure, unhandled rejection, migration error, duplicate reward, retry storm or unexpected external transaction attempt.
- The final encrypted off-host backup restores into an isolated directory with matching checksum, SQLite integrity, schema version and crown, payment, reign, content, reward and mint counts.
- Production and the activation runbook both show paid takeover disabled. Activation requires completed legal gates and a separate explicit owner command that is not run in this phase.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm ci`
- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run test:e2e`
- `cd web && npm run test:a11y`
- `cd web && npm run test:performance`
- `cd web && npm run security:check`
- `cd web && npm run build`
- `cd web && npm audit --omit=dev --audit-level=high`
- `cd web && npm run ops:smoke -- --origin=https://kingofthescreen.fun --expect-payments=disabled`
- `ssh -o BatchMode=yes kots-production 'sudo -n /opt/kots/current/ops/vps/verify-hardening.sh --redacted'`
- `ssh -o BatchMode=yes kots-production 'sudo -n /opt/kots/current/ops/backup/restore-drill.sh --latest --isolated --redacted'`
- `git diff --check`
- `git status --short --branch`

## Evidence required in transcript

- A route-by-route copy audit and the final wallet, quote, moderation, reservation, transaction, recovery, reward, NFT, admin and outage state matrix.
- Screenshots at each required viewport and zoom, plus keyboard focus and reduced-motion verification.
- Axe, contrast and accessibility reports with zero serious or critical violations.
- Three performance reports, their median, the JavaScript bundle report and the recorded budgets.
- The final security route matrix, malformed-input results and adversarial Solana fixture corpus.
- Coverage summaries and local plus production E2E output.
- The dependency audit, direct dependency inventory and release manifest.
- The complete diff and secret-scan review ledger with zero unresolved P0 or P1 finding.
- Production host, TLS, header, timer, disk and redacted log verification.
- Final off-host backup receipt and isolated restore comparison.
- Server status and activation-runbook evidence that payments remain disabled.

## Notes

This is the required final polish phase. Fix every failure found, then rerun the affected check and the full gate set. Do not lower thresholds, remove security assertions, exclude critical domains from coverage or label a failed check as acceptable. Use read-only production tests. Do not sign, broadcast, mint, buy or transfer assets. Do not enable paid takeover. The next parent-goal step is legal and compliance review, not payment activation.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
