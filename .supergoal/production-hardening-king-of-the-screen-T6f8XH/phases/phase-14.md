SUPERGOAL_PHASE_START
Phase: 14 of 16 — Stage VPS hardening
Task: Harden the existing VPS in recoverable stages while preserving access, data and a fast return path.
Type: operations, vps, security, access-control, secrets, backup
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run test:e2e, cd web && npm run build, ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n sshd -t', ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n nginx -t', ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n systemd-analyze verify /etc/systemd/system/kots-web.service /etc/systemd/system/kots-sentinel.service', ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n /opt/kots/current/ops/vps/verify-hardening.sh --redacted', curl --fail --silent --show-error https://kingofthescreen.fun/api/health, ! curl --fail --max-time 5 http://kingofthescreen.fun:3000/, cd web && npm audit --omit=dev --audit-level=high
Acceptance criteria: 19
Evidence required: encrypted pre-change backup manifest, temporary API guard checks, second-session SSH proof, redacted secret rotation ledger, service identity and permission output, firewall and fail2ban status, listening socket evidence, TLS and header evidence, backup timer and restore evidence, rollback checkpoint log
Depends on phases: 13

## Why

The current root services, open application port, password SSH and broad secret permissions leave one host compromise path with full application and wallet impact.

## Work

- Execute the documented production change approval and keep a recovery session open for all SSH, firewall and service-account changes.
- Capture a redacted inventory and an encrypted off-host pre-change backup of application data, SQLite files and WAL files, environment files, service definitions, Nginx configuration, SSH configuration, PM2 state and the current release.
- Verify archive checksum and an isolated restore before changing network access or service ownership.
- Install a reversible Nginx guard that blocks takeover confirmation, payment-intent creation and unsafe telemetry or admin mutations while the old release is still running.
- Create a named non-root operator with the existing authorized public key and restricted passwordless sudo entries needed for KOTS operations. Verify login and `sudo -n` in a second session before changing root access.
- Apply SSH key-only authentication with configuration fragments, validate with `sshd -t` and reload SSH. Disable password, keyboard-interactive and direct root login only after the second session succeeds.
- Enable UFW with default-deny inbound rules, explicit 80 and 443 access, rate-limited SSH and no public application port.
- Install and enable fail2ban for SSH with a bounded, documented jail policy.
- Create dedicated non-login web and worker users plus the minimum shared data group. Move release, data and configuration paths to the packaged ownership and mode matrix.
- Separate web and Sentinel environment files. Ensure only Sentinel can read the hot or reward-wallet key and ensure neither service runs with UID 0.
- Inventory credentials by identifier without recording values. Rotate and revoke the current admin credential and current RPC API credential, then invalidate old admin sessions. Rotate every other credential demonstrated as exposed. Never print, copy to Git or place a secret in shell history.
- Treat hot-wallet rekeying as a separate owner-approved asset migration. If no private key exposure is established, isolate the existing key and record the decision. If exposure is established, keep paid features disabled and stop before moving assets until explicit financial authorization exists.
- Provision a separate minimally funded NFT mint authority only under explicit funding limits. Keep NFT work disabled if the authority is absent, unverified or over the approved balance cap. Never reuse the hot or reward wallet as an implicit NFT signer.
- Install and validate the direct `kots-web.service` and `kots-sentinel.service` units under different non-root users, but do not start them or disable PM2 until phase 15 switches a validated release.
- Block public access to port 3000 at the firewall, load the hardened Nginx configuration and prove HTTPS remains healthy. Loopback binding follows during the phase 15 service switch.
- Enable bounded system journal or log rotation, backup timers, disk-space alerts and automatic security update policy suitable for the small host.
- Run the packaged hardening verifier, perform an isolated restore from the first scheduled backup and record each rollback checkpoint.

## Acceptance criteria (all must pass — verify each in transcript)

- Before the first mutation, an encrypted off-host archive exists with checksum, timestamp, baseline commit or release ID and a redacted file inventory covering state, data, configuration and service definitions.
- The pre-change archive restores into an isolated path and passes checksum, SQLite integrity, schema version and recorded crown, payment, reign and job-count invariants.
- A temporary Nginx guard rejects payment intent, takeover confirmation, unauthenticated admin and signature-bearing telemetry mutations on the old release while the public page and read-only state remain healthy.
- A non-root operator login succeeds with the authorized key in a second independent SSH session and `sudo -n` succeeds for the documented restricted operations before SSH access settings change.
- `sshd -t` passes, password and keyboard-interactive authentication are disabled, direct root login is disabled, and a fresh key-only operator session succeeds after reload.
- UFW is active with default-deny inbound policy, public access limited to the documented SSH, HTTP and HTTPS rules, and no rule exposes the application port.
- Fail2ban is active, the SSH jail is enabled and a status check reports its policy without an unbounded ban or accidental operator lockout.
- Dedicated web and worker identities have non-login shells, stable UIDs and minimal group membership. Their installed systemd units declare non-root identities; legacy PM2 remains recorded as the phase-15 rollback source.
- The web identity cannot read the hot-wallet key, the worker can read only its protected wallet file, and mutable database access follows the documented shared-data permissions.
- Every environment or key file is owned by its service identity or root, has mode 0600 or a stricter effective ACL, and every containing secret directory has mode 0750 or stricter.
- The current admin credential and current RPC API credential are rotated and revoked, old admin sessions fail, the application uses the replacement RPC credential, and the redacted ledger contains identifiers plus dates without any secret value.
- The hot-wallet key decision records evidence of exposure or non-exposure. No asset transfer or wallet replacement occurs without a distinct owner approval recorded in the transcript.
- NFT processing remains disabled until a distinct minimally funded mint authority is provisioned, permission-isolated from the web user and verified against the approved balance cap. No fallback uses the reward-wallet key.
- Direct `kots-web.service` and `kots-sentinel.service` unit files pass `systemd-analyze verify`, declare different non-root users and reference the versioned release layout. They remain disabled until phase 15. Root PM2 remains available only as a verified rollback source.
- UFW blocks external TCP port 3000, HTTPS works through Nginx and an external connection to port 3000 fails. The phase-15 release switch changes the web listener to loopback.
- Nginx passes syntax validation and serves TLS plus the approved HSTS, CSP, content-type, referrer, permissions and frame-protection headers without `X-Powered-By`.
- Journald or logrotate has bounded retention, disk usage stays under the documented alert threshold and unattended security updates are enabled with a documented reboot procedure.
- The production backup timer is enabled, its latest run reaches the off-host destination with a matching checksum, and an isolated restore of that run passes all database invariants.
- The hardening verifier reports success, the public site remains healthy with paid endpoints blocked, and every staged change has a tested command to restore its immediately preceding state.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run test:e2e`
- `cd web && npm run build`
- `ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'id -u && sudo -n true'`
- `ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n sshd -t'`
- `ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n nginx -t'`
- `ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n systemd-analyze verify /etc/systemd/system/kots-web.service /etc/systemd/system/kots-sentinel.service'`
- `ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n systemctl is-active nginx fail2ban ufw'`
- `ssh -o BatchMode=yes "${KOTS_SSH_TARGET:?}" 'sudo -n /opt/kots/current/ops/vps/verify-hardening.sh --redacted'`
- `curl --fail --silent --show-error https://kingofthescreen.fun/api/health`
- `! curl --fail --max-time 5 http://kingofthescreen.fun:3000/`
- `cd web && npm audit --omit=dev --audit-level=high`

## Evidence required in transcript

- The encrypted pre-change archive manifest, checksum, off-host receipt and isolated restore result, all redacted.
- HTTP status evidence for the temporary Nginx API guard and the still-healthy public read path.
- Separate-session key login and restricted `sudo -n` evidence before and after the SSH reload.
- Redacted SSH, UFW and fail2ban status showing the accepted access policy.
- A credential rotation ledger proving replacement and revocation of the current admin and RPC credentials, with identifiers, dates and verification state but no values.
- The NFT mint-authority provisioning state, balance-cap check and disabled-worker proof, without public keys or private material beyond what the runbook explicitly permits.
- Prepared service-unit, legacy-PM2 rollback, file ownership, effective permission and listening-socket output.
- HTTPS response headers plus failed external application-port output.
- Backup timer status, latest off-host checksum and isolated restore invariants.
- The ordered rollback checkpoint log with one health result after each high-risk stage.

## Notes

Use `systemctl reload` for SSH and Nginx after syntax checks. Keep the original privileged session open until a second key-only operator session and restricted sudo access have been tested. Apply UFW rules before enabling UFW, then test a fresh session. Do not display environment files, private key JSON, tokens or credential-bearing URLs. A command that emits a secret invalidates the evidence and triggers immediate rotation. Never move wallet assets during this phase without explicit financial authorization. Leave `PAID_TAKEOVER_ENABLED=false` throughout host preparation. The live service migration occurs only in phase 15.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
