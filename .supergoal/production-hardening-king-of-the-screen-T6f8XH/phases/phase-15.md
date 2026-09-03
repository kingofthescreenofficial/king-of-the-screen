SUPERGOAL_PHASE_START
Phase: 15 of 16 — Deploy paused release
Task: Push and atomically deploy the audited release with paid takeover disabled, then prove health, rollback and data recovery.
Type: deployment, production, migration, smoke-test, rollback
Mandatory commands: cd web && npm ci, cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run test:e2e, cd web && npm run build, cd web && npm audit --omit=dev --audit-level=high, git diff --check, cd web && npm run ops:smoke -- --origin=https://kingofthescreen.fun --expect-payments=disabled, KOTS_E2E_BASE_URL=https://kingofthescreen.fun npm run test:e2e:smoke, ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n /opt/kots/current/ops/verify-release.sh --expect-payments=disabled'
Acceptance criteria: 19
Evidence required: deployment approval record, remote commit and release manifest match, verified pre-deploy backup, migration and import invariants, atomic switch log, disabled-payment API matrix, production smoke and E2E output, process and network output, rollback and redeploy transcript, isolated restore transcript
Depends on phases: 14

## Why

The hardened release must reach production without accepting funds, losing legacy state or removing the ability to return to the prior known state.

## Work

- Confirm that the recorded plan approval covers the named branch push and staged production deployment. Do not merge another branch or enable payments unless separately authorized.
- Re-run every local release gate from a clean install and require a clean diff except for the intended release changes.
- Commit with the agreed conventional format, push the exact release commit to `origin/codex/production-hardening` and verify the remote SHA before packaging.
- Build the immutable artifact and release manifest from that exact commit. Transfer the artifact by the documented authenticated path and verify its checksum on the VPS.
- Confirm `PAID_TAKEOVER_ENABLED=false` in the protected production environment without printing the file or value set around it.
- Verify the legacy admin credential and legacy RPC API credential are revoked, the replacement RPC path works and no command, response or log prints either replacement value.
- Create and verify a new encrypted off-host pre-deploy backup of database, WAL, state import source, uploads, reward records, configuration and current release metadata.
- Run migration and legacy import in dry-run mode against a restored copy. Record schema version, expected counts, duplicate detection and payment or signature uniqueness results.
- Put the public app into the documented bounded maintenance state, stop only the services required for the migration, apply migrations once and import legacy state idempotently.
- Switch the current symlink atomically, start the non-root services and remove the temporary old-release Nginx guard only after the new server-side disabled-payment checks pass.
- Run public health, homepage, static asset, state, legal-page and wallet-connect smoke checks without signing or broadcasting any transaction.
- Verify the full disabled-payment matrix. Payment-intent creation and takeover confirmation must fail closed with a documented maintenance response before any wallet request appears.
- Verify unauthenticated admin access fails, authenticated read-only administration works, signature telemetry is rejected and no sensitive values appear in responses.
- Validate database crown, reign, payment, content, job and mint invariants after migration. Confirm unique transaction signatures and idempotency keys.
- Confirm direct `kots-web.service` and `kots-sentinel.service` units run under different non-root users without PM2, the web listener remains loopback-only, port 3000 stays closed externally and Nginx serves the expected TLS and security headers.
- Confirm the Sentinel performs no automatic $KOTS buy or transfer. Keep NFT work disabled unless a distinct minimally funded mint authority is provisioned, permission-isolated and under its approved balance cap.
- Inspect bounded production logs for startup errors, migration errors, secret leakage, retry storms and unhandled rejections.
- Rehearse the documented production rollback to the prior release and its matching data snapshot, verify health, then redeploy the new release and verify all paused-release checks again.
- Restore the post-deploy backup into an isolated directory and compare schema plus core invariant counts with the running database. Retain the prior release and rollback snapshots according to policy.

## Acceptance criteria (all must pass — verify each in transcript)

- The transcript contains explicit approval for the feature-branch push and staged deployment, and records that no merge, payment activation or wallet asset movement is included.
- A clean `npm ci` run followed by lint, typecheck, unit, integration, coverage, E2E, build and dependency audit gates exits zero with at least 80 percent configured coverage and zero critical or high production advisories.
- The pushed `origin/codex/production-hardening` SHA equals the local release SHA, and the immutable artifact manifest contains that SHA plus matching lockfile and artifact checksums.
- Before migration or release switching, a fresh encrypted off-host backup passes checksum, SQLite integrity and isolated restore checks and names the prior release ID.
- Migration and legacy import dry-run output records expected source and target counts, rejects duplicate signatures or idempotency keys and proves a second run makes no changes.
- The production migration completes once, reaches the expected schema version and preserves the recorded crown, history, content, payment, reward and mint invariants.
- The release appears under a versioned directory, the current symlink changes atomically and both packaged services reach healthy state without an extended unplanned outage.
- The protected production configuration and server status endpoint both report paid takeover disabled without exposing environment contents or secrets.
- The legacy admin and RPC credentials fail, the replacement RPC path passes a redacted health check, old admin sessions remain invalid and neither replacement value appears in output or logs.
- Payment-intent creation and takeover confirmation reject requests before a wallet transaction request or on-chain action, and the disabled response is consistent in API and UI.
- Homepage, static assets, read-only current state, legal pages and wallet connection render successfully over HTTPS on supported desktop and mobile viewports without broadcasting a transaction.
- Unauthenticated admin routes return 401 or 403, authenticated read-only administration succeeds, telemetry refuses transaction signatures and no admin or credential data appears in public responses.
- Post-migration database checks confirm one authoritative crown, unique transaction signatures, unique intent and idempotency keys, valid foreign keys and the documented record counts.
- Direct `kots-web.service` and `kots-sentinel.service` run under different non-root UIDs with no PM2 parent, restart successfully, the application listens on loopback only and external port 3000 remains unreachable.
- HTTPS responses carry the approved security headers, Nginx hides framework disclosure and public rate-limit checks behave according to the runbook without blocking ordinary reads.
- During deployment and smoke tests Sentinel performs no automatic $KOTS market buy or token transfer. NFT work stays disabled unless its separate minimally funded authority passes permission and balance-cap checks. No duplicate mint or production payment transaction is signed or broadcast.
- Redacted production logs contain no startup, migration, unhandled rejection, secret leakage or unbounded retry errors across deployment, rollback and redeployment.
- A full rollback returns the prior release and paired data snapshot to healthy state, then redeployment returns the new payment-paused release to healthy state with the same migration invariants.
- A post-deploy encrypted backup restores into an isolated directory with matching checksum, integrity, schema and core counts, while the prior release plus required rollback snapshots remain retained.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm ci`
- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run test:e2e`
- `cd web && npm run build`
- `cd web && npm audit --omit=dev --audit-level=high`
- `git diff --check`
- `git fetch origin && test "$(git rev-parse HEAD)" = "$(git rev-parse origin/codex/production-hardening)"`
- `cd web && npm run ops:smoke -- --origin=https://kingofthescreen.fun --expect-payments=disabled`
- `cd web && KOTS_E2E_BASE_URL=https://kingofthescreen.fun npm run test:e2e:smoke`
- `ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n /opt/kots/current/ops/verify-release.sh --expect-payments=disabled'`
- `ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n systemctl is-active kots-web kots-sentinel nginx fail2ban ufw'`
- `ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n /opt/kots/current/ops/backup/restore-drill.sh --latest --isolated --redacted'`

## Evidence required in transcript

- The approval record plus local, remote and manifest commit SHA equality.
- Clean release-gate output and the production dependency audit result.
- The pre-deploy backup receipt, checksum, isolated restore result and prior release ID.
- Migration dry-run, live migration and second-run output with redacted invariant counts.
- Artifact checksum, atomic release switch, service startup and disabled-payment configuration proof.
- Production API status matrix, browser smoke results and read-only production E2E screenshots.
- Direct systemd unit, distinct process UID, listening socket, firewall, TLS and security-header verification.
- Redacted proof that legacy admin and RPC credentials are revoked and the replacement RPC health check succeeds.
- Redacted worker and application logs proving no automated buy, transfer, duplicate mint or leaked secret.
- Rollback, health, redeployment and repeated paused-release verification output.
- Post-deploy backup receipt and isolated restore comparison against the running database.

## Notes

Do not merge to `main` unless that external action is explicitly approved. Do not use a real wallet transaction, mint or token transfer as a smoke test. Keep paid takeover disabled at both the UI and server layers. Stop and roll back when migration counts diverge, health fails, a service runs as root, a public paid endpoint accepts a request, port 3000 is reachable, or a secret appears in output.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
