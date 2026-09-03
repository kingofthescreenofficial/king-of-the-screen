SUPERGOAL_PHASE_START
Phase: 2 of 16 — Freeze unsafe surfaces
Task: Default paid actions and unauthenticated operational endpoints to a closed state.
Type: security, kill-switch, api, telemetry
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm test -- tests/security/freeze-surfaces.test.ts, cd web && npm run test:coverage, cd web && npm run build, curl --fail --silent --show-error https://kingofthescreen.fun/api/state, test "$(curl --silent --show-error --write-out '%{http_code}' --output /dev/null -X POST https://kingofthescreen.fun/api/takeover)" = 503
Acceptance criteria: 15
Evidence required: security regression matrix, route test output, client disabled-state test, emergency release backup and status matrix, secret scan output, full quality-gate exit codes
Depends on phases: 1

## Why

The current public routes expose operational data and accept weak payment claims, so every unsafe path must fail closed before deeper refactoring begins.

## Work

- Add server-side feature flag `PAID_TAKEOVER_ENABLED=false` by default.
- Ensure takeover purchase UI cannot create a wallet transaction while the flag is off.
- Make `/api/takeover` and payment confirmation paths reject paid submissions while paused.
- Remove transaction signatures, wallet addresses and reward identifiers from public telemetry payloads.
- Close the admin dashboard, telemetry deletion and takedown operations until phase 8 provides authenticated sessions.
- Remove browser-side password comparison and local-storage authorization.
- Require secrets from environment for emergency controls and reject fallback defaults.
- Reject administrative secrets in query strings.
- Reject transaction signatures, authorization values and private-key fields at the telemetry boundary.
- Add tests proving unauthenticated admin reads, telemetry deletes and takedown without secret fail.
- Add visible maintenance copy that says paid takeovers are temporarily paused.
- Keep the public site readable and current crown display functional.
- After all local phase gates pass, make one minimal emergency production release through the current documented VPS deployment path. Back up the existing web release and state metadata first, set `PAID_TAKEOVER_ENABLED=false`, restart only the web process, then verify the disabled-payment and protected-route matrix. Do not alter wallets, data, Sentinel logic, SSH, firewall or credentials in this emergency release.

## Acceptance criteria (all must pass — verify each in transcript)

- With `PAID_TAKEOVER_ENABLED` absent, empty, `false` or unrecognized, the server reports payments disabled and never treats the value as enabled.
- A disabled `POST /api/takeover` returns HTTP 503 with `PAYMENTS_DISABLED` before any RPC call, file write, database write or queue append.
- The client renders a paused state, disables the final action and invokes neither transaction construction nor wallet send while payments are disabled.
- The server is the authority for the paid capability, and changing a browser value or request body cannot turn it on.
- Unauthenticated admin dashboard requests return 401 or 404 and contain no telemetry, wallet, reward or queue data.
- Unauthenticated telemetry deletion and takedown requests return 401 or 404 and change no stored state.
- Takedown rejects query-string credentials, has no fallback credential and stays closed when server configuration is absent.
- No client bundle or maintained source file contains a plaintext admin password or implements authorization with local storage.
- The takeover client sends no payment signature, paid amount or reward wallet to telemetry before settlement.
- Telemetry rejects raw transaction signatures, authorization headers, private-key fields and other designated secret keys with HTTP 400.
- Default logs contain no complete wallet, transaction signature, session token, API key or credential-bearing URL.
- Focused tests cover every flag variant, protected endpoint, telemetry rejection and client no-send behavior with zero failures.
- All mandatory lint, typecheck, tests, coverage and build commands exit with code 0 while the production flag remains false.
- The emergency release has a timestamped pre-change web and state-metadata archive, a recorded rollback command and a redacted release identifier.
- The live public state endpoint remains HTTP 200, while live takeover, payment-intent, unauthenticated admin dashboard, telemetry delete and unauthenticated takedown requests return their documented closed statuses without state mutation.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm test -- tests/security/freeze-surfaces.test.ts`
- `cd web && npm run test:coverage`
- `cd web && npm run build`
- `curl --fail --silent --show-error https://kingofthescreen.fun/api/state`
- `test "$(curl --silent --show-error --write-out '%{http_code}' --output /dev/null -X POST https://kingofthescreen.fun/api/takeover)" = 503`

## Evidence required in transcript

- Show a matrix of route, authentication state, expected status, actual status and mutation count.
- Show the focused security test count and its zero-failure result.
- Show the client test proving transaction construction and send mocks were called zero times.
- Show repository scans for client password logic, fallback secrets and signature telemetry with zero maintained-source findings.
- Show sanitized rejection logs without complete wallet or signature values.
- Show the redacted emergency-release backup identifier, rollback command and live API status matrix.
- Show the last output lines and exit code for every mandatory command.

## Notes

This phase is a safety stop. Do not re-enable payments later in this code run.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
