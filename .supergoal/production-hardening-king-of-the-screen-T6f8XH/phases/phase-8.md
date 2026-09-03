SUPERGOAL_PHASE_START
Phase: 8 of 16 — Secure administrative access
Task: Replace browser-held secrets with server sessions, CSRF protection, rate limits, authorization, and an append-only audit trail.
Type: brownfield, backend, admin, authentication, security, ui
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run build, cd web && npm run test:e2e
Acceptance criteria: 10
Evidence required: route authorization matrix, cookie proof, CSRF tests, rate-limit test, audit redaction proof, admin E2E
Depends on phases: 4, 7

## Why

The current client-side password and unprotected APIs expose operational data and destructive controls to any visitor.

## Work

- Remove hardcoded admin passwords, fallback takedown secrets, query-string credentials, and localStorage authentication from application code and browser bundles.
- Add validated server-only admin configuration. Store only a password hash, require a strong session-signing or token-hashing secret, and fail closed when required production settings are absent.
- Implement login and logout endpoints with generic failure messages, constant-time credential verification, bounded request bodies, and persistent rate limits keyed by normalized account and network source.
- Use at least 256 bits of cryptographic randomness for opaque session tokens. Store only a token hash in SQLite and send the raw value in a `Secure`, `HttpOnly`, `SameSite=Strict`, path-scoped cookie with idle and absolute expiry.
- Build one `requireAdmin` authorization helper and apply it to every admin dashboard, telemetry, moderation, recovery, reward, NFT, and takedown endpoint. Default-deny any new route under the admin namespace.
- Add per-session CSRF tokens plus strict Origin validation to every state-changing admin request. Reject missing, stale, cross-session, and cross-origin tokens before the handler executes.
- Revoke the database session on logout, password-secret rotation, absolute expiry, and explicit operator revocation. Rotate the session identifier after successful login.
- Render the admin page only after server authorization. Add a dedicated login view and ensure protected data never appears in the unauthenticated HTML or client hydration payload.
- Require an operator reason for takedown and recovery or reward overrides. Write append-only audit events for login outcome, logout, takedown, recovery, moderation, reward, and NFT actions without raw cookies, passwords, CSRF tokens, private keys, or full transaction signatures.
- Add unit, integration, and browser tests for authentication, authorization, session lifecycle, CSRF, rate limiting, audit events, and the protected admin flow.

## Acceptance criteria (all must pass — verify each in transcript)

- [ ] AC8.1: Repository and built-client scans find no hardcoded admin password, fallback takedown secret, query-string authentication, or localStorage-based admin grant in production code.
- [ ] AC8.2: Missing or malformed admin hash and session-secret configuration makes login unavailable with a generic server response, logs a redacted configuration error, and never creates a session.
- [ ] AC8.3: Valid login creates one hashed database session and a cookie with `Secure`, `HttpOnly`, `SameSite=Strict`, explicit `Path`, idle expiry, and absolute expiry; invalid login returns the same generic error shape without a cookie.
- [ ] AC8.4: A rate-limit integration test crosses the configured failed-login threshold, receives HTTP 429 with retry metadata, and proves a successful login from the limited key is blocked until the test clock advances.
- [ ] AC8.5: An authorization matrix test calls every admin API method and the admin page without a session and proves APIs return 401 or 403 while the page redirects to login without protected payload data.
- [ ] AC8.6: State-changing admin route tests reject absent, incorrect, expired, cross-session, and invalid-Origin CSRF requests and prove the target database rows are unchanged.
- [ ] AC8.7: Logout, explicit revocation, idle expiry, and absolute expiry each invalidate the cookie-backed session; replaying its former token cannot read dashboard data or execute a mutation.
- [ ] AC8.8: Successful and failed privileged actions create append-only audit rows with actor session ID, action, target, result, reason, and timestamp; a scan proves audit payloads contain none of the forbidden secret fields or full signatures.
- [ ] AC8.9: Takedown and recovery or reward override endpoints require an authenticated session, a valid CSRF token, and a non-empty bounded reason; omitting any one produces no state change.
- [ ] AC8.10: The admin E2E test logs in, loads protected dashboard data, completes one harmless audited control action, logs out, then proves the dashboard is inaccessible; the test also asserts paid takeover remains disabled.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run build`
- `cd web && npm run test:e2e`

## Evidence required in transcript

- Show the scan command and zero-match result for browser-held or hardcoded admin credentials.
- Show the route authorization matrix with one row per admin endpoint and expected unauthenticated status.
- Show the login response headers with the cookie value redacted and all required attributes visible.
- Show focused CSRF, session-expiry, revocation, and persistent rate-limit test output with exit code 0.
- Show representative redacted audit rows for login and the harmless control action.
- Show the admin E2E summary and screenshots of the login view and authenticated dashboard, with secret values obscured.
- Print a criterion table for AC8.1 through AC8.10 with `pass` and one concrete file, route, or test reference per row.

## Notes

Never print or store raw credentials in fixtures, snapshots, logs, screenshots, or planning artifacts. Tests must generate ephemeral secrets. Use a server-side redirect or authorization boundary rather than a client-only visibility check.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
