SUPERGOAL_PHASE_START
Phase: 13 of 16 — Package production operations
Task: Create deterministic release, service, proxy, backup, restore, rollback and operations assets for the payment-paused application.
Type: operations, deployment, security, backup, rollback
Mandatory commands: cd web && npm ci, cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run test:e2e, cd web && npm run build, cd web && npm run ops:validate, cd web && npm run backup:test, cd web && npm audit --omit=dev --audit-level=high, git diff --check
Acceptance criteria: 16
Evidence required: redacted environment validation transcript, release manifest, service and Nginx validation output, backup and isolated restore transcript, rollback rehearsal transcript, production directory and permission matrix, operations runbook excerpt
Depends on phases: 3, 4, 8, 10, 11, 12

## Why

Production changes need repeatable, least-privilege procedures that preserve data and return the service to a known release when a deployment fails.

## Work

- Add a typed server-side environment schema that distinguishes web, worker, build-time and optional settings. Fail startup on missing or malformed required values.
- Keep `PAID_TAKEOVER_ENABLED=false` as the shipped default. Require both legal approval and an explicit operator action in the activation procedure.
- Add redacted environment examples and preflight commands. Never place live values, private keys, credentials or full connection URLs in Git, command output, process definitions or release manifests.
- Define an immutable release layout such as `/opt/kots/releases/<release-id>` with an atomic `/opt/kots/current` symlink, mutable data under `/var/lib/kots`, protected configuration under `/etc/kots` and logs managed by journald or logrotate.
- Package exactly two direct systemd application units, `kots-web.service` and `kots-sentinel.service`, under distinct non-root users. Their `ExecStart` commands must run Node or the application entrypoint directly without PM2. Give the web process no access to reward-wallet or mint-authority keys.
- Split web and Sentinel environment files. Keep the hot or reward wallet key in the Sentinel scope only. If NFT issuance requires a signing key, define a separate minimally funded mint-authority secret and keep NFT work disabled until that authority is provisioned and verified.
- Bind Next.js to `127.0.0.1` and expose it through Nginx. Package Nginx limits, timeouts, rate limits, TLS proxy settings and response security headers.
- Add a deterministic release command based on `npm ci` and the application lockfile. Emit a manifest with commit SHA, lockfile hash, Node version, migration version and artifact checksum.
- Add idempotent preflight and deploy scripts with a dry-run mode, explicit target validation, health checks and atomic release switching.
- Add SQLite WAL-safe backup automation using the SQLite backup API or an equivalent consistent snapshot. Run `integrity_check`, encrypt the artifact, calculate a checksum and apply retention without exposing encryption material.
- Add an off-host backup adapter and a preflight that proves the destination is writable. A missing destination must keep payment activation blocked while still allowing the documented payment-paused deployment.
- Add an isolated restore command that verifies checksum, decrypts into a temporary directory, runs SQLite integrity checks and validates schema plus core row-count invariants before any production replacement.
- Add rollback automation that returns the symlink to the prior release, restarts services, verifies health and restores the matching database snapshot when a migration is not backward-compatible.
- Write an operator runbook covering preflight, backup, deploy, health verification, log review, rollback, restore, credential rotation and incident containment.
- Add automated tests for environment validation, release manifests, deployment target guards, backup integrity, restore invariants and rollback selection.

## Acceptance criteria (all must pass — verify each in transcript)

- The web and worker fail with a nonzero exit code when any required environment value is absent or malformed, and automated tests cover valid, invalid and redacted configurations.
- Repository examples and generated manifests contain variable names only. A repository secret scan reports no private keys, passwords, tokens, RPC API keys or live session secrets.
- One release command produces an immutable artifact and manifest whose commit SHA, lockfile hash, Node version, migration version and checksum match the checked-out source.
- Packaged `kots-web.service` and `kots-sentinel.service` units use different dedicated non-root identities, direct `ExecStart` commands with no PM2 wrapper, predictable restart policy and systemd sandboxing without broad release-tree write access.
- The packaged permission matrix prevents the web identity from reading the hot or reward-wallet key, Sentinel environment and mint-authority key. The Sentinel identity reads only its protected worker secrets.
- NFT processing defaults to disabled, remains disabled when the separate minimally funded mint authority is absent or invalid, and has automated tests proving startup never falls back to the reward-wallet key for NFT signing.
- The packaged web service listens on `127.0.0.1` only and exposes a health endpoint that reports readiness without secrets, wallet balances or internal paths.
- The packaged Nginx configuration proxies only to loopback, enforces request-body and rate limits, sets the approved security headers, hides framework disclosure and passes configuration validation.
- The deploy preflight rejects a broad, empty or unexpected target, supports `--dry-run` and performs no mutation until the target, release manifest, free space, database and service prerequisites pass.
- Deployment uses a versioned release directory and an atomic current-release switch. Re-running the same release is idempotent and does not duplicate migrations or jobs.
- The backup command creates a WAL-consistent encrypted archive, verifies SQLite integrity first, writes a checksum and retention metadata, and never prints key material.
- The off-host adapter verifies an upload and checksum round trip. If it is unconfigured, the activation preflight fails while the payment-paused deployment preflight remains available.
- The restore command restores the latest test archive into an isolated directory and proves checksum, decryption, SQLite integrity, migration version and documented row-count invariants.
- A local rollback rehearsal switches from a synthetic new release to the prior release, starts the prior service definition and restores its paired test database when required.
- The runbook names exact commands, expected success signals, rollback triggers, escalation prerequisites and secret-redaction rules for every production operation introduced in this phase.
- Lint, typecheck, unit, integration, coverage, E2E, build and production dependency audit gates all pass, with at least 80 percent configured coverage and zero critical or high production advisories.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm ci`
- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run test:e2e`
- `cd web && npm run build`
- `cd web && npm run ops:validate`
- `cd web && npm run backup:test`
- `cd web && npm audit --omit=dev --audit-level=high`
- `git diff --check`

## Evidence required in transcript

- Redacted output proving invalid environment fixtures fail and valid web plus worker fixtures pass.
- A release manifest with hashes and version identifiers, with all credential values omitted.
- Static validation output for both service units, the Nginx configuration and the loopback binding rule.
- The generated production directory, owner, group and file-mode matrix.
- Backup output showing SQLite integrity, encryption, checksum and off-host round-trip results without secret material.
- Isolated restore output showing checksum match, schema version and the recorded invariant counts.
- Rollback rehearsal output showing the release before failure, the selected prior release and the final healthy state.
- A runbook excerpt containing deploy, rollback and restore commands plus their stop conditions.

## Notes

Use the two direct systemd units as the production target. PM2 is only the rollback source during migration and must not remain in the final service path. Do not touch production in this phase. Use fixtures and temporary directories for backup and rollback tests. Treat any output that includes a secret value as a phase failure and rotate that value before continuing.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
