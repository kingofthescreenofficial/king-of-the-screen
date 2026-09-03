SUPERGOAL_PHASE_START
Phase: 12 of 16 — Refactor client experience
Task: Split oversized client code into typed flows and present honest, accessible, responsive states while payments remain disabled.
Type: brownfield, frontend, refactor, ui, accessibility, performance
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run build, cd web && npm run test:e2e
Acceptance criteria: 10
Evidence required: component map and line counts, copy scan, accessibility report, responsive screenshots, disabled-payment E2E, bundle budget
Depends on phases: 2, 5, 7, 9, 10, 11

## Why

The client must explain each durable server state accurately and remain usable without hiding security-sensitive behavior inside one oversized modal.

## Work

- Split the current takeover modal and page orchestration by product state: content draft, moderation, quote or reservation, wallet review, chain confirmation, settlement, recovery, reward, and NFT. Put side effects in focused hooks or services and keep presentation components controlled and typed.
- Generate or define typed API contracts for state, content, intent, settlement, recovery, reward, and NFT responses. Use one client request helper that validates response envelopes and maps stable server error codes to user-safe copy.
- Model the takeover flow as an explicit reducer or state machine. Reject illegal transitions, ignore repeated submit clicks, cancel stale requests on close or navigation, and recover safely after refresh from server state rather than browser-only flags.
- Render a clear payment-paused notice and disabled takeover action when `PAID_TAKEOVER_ENABLED=false`. Ensure disabled mode never requests a quote, constructs a transaction, calls wallet signing, or posts a confirmation.
- Remove the fabricated live-viewer count and synthetic activity. Label any genuine telemetry-derived aggregate with its measurement window; render an unavailable state when no trustworthy value exists.
- Remove or revise unsupported claims about automatic `$KOTS` purchases or airdrops, automatic delivery, guaranteed NFT issuance, a green candle, millions of users or value, price growth, investment outcomes, network support, transaction status, and scarcity. Drive reward and NFT labels only from the durable proof states created in phases 10 and 11.
- Remove transaction signatures and full wallet addresses from analytics payloads, browser persistence, public telemetry, error-reporting context, and client logs. Use short-lived opaque correlation IDs where a flow needs support tracing.
- Add complete loading, empty, rejected, expired, conflict, recovery-needed, provider-unavailable, retry, and success views. Never turn a recoverable paid-transaction state into a generic failure that loses its reference ID.
- Make modal and admin-adjacent status components keyboard complete: semantic controls, visible focus, initial focus, focus trap, Escape handling where safe, focus restoration, labelled fields, status announcements, and no color-only meaning.
- Verify layouts at 320, 768, and 1440 CSS pixels. Keep primary controls, error text, wallet identifiers, media previews, and legal acknowledgement readable without horizontal page overflow.
- Add component, integration, and E2E coverage for state transitions, disabled payments, content review, conflict or recovery, reward proof states, NFT states, accessibility, responsive layout, and request deduplication. Record a route bundle budget and prevent regression above it.

## Acceptance criteria (all must pass — verify each in transcript)

- [ ] AC12.1: Production React files contain no component over 400 lines, `TakeoverModal` is at most 250 lines, and a documented component map shows separate typed owners for content, checkout state, recovery, reward, and NFT presentation.
- [ ] AC12.2: Tests prove the explicit client state machine accepts every documented transition, rejects every illegal transition, and two rapid submit actions produce one API request and at most one wallet-signing request.
- [ ] AC12.3: Every API call used by the page, takeover flow, reward card, NFT card, and admin-linked status UI passes through the typed response-envelope validator; malformed and unknown responses render a generic safe error without exposing raw server details.
- [ ] AC12.4: With the production-default payment flag off, E2E proves the paused notice is visible, the paid action is disabled, and spies record zero quote, intent, RPC-send, wallet-sign, and confirmation calls.
- [ ] AC12.5: Source, built-bundle, rendered-copy, and telemetry tests find no simulated viewer count or activity, transaction signature or full wallet telemetry, and none of the fixture-listed auto-airdrop, green-candle, millions, guaranteed-return, false network, false transaction, royalty, or scarcity claims.
- [ ] AC12.6: Fixture-driven UI tests map each moderation, intent, settlement, recovery, reward, and NFT backend state to the specified loading, empty, actionable, or terminal view, including a persistent reference ID for every paid recovery state.
- [ ] AC12.7: Automated accessibility checks report zero critical or serious violations on home, takeover modal states, Hall of Fame, reward and NFT states; keyboard tests prove focus entry, containment, Escape behavior, restoration, labels, and live status announcements.
- [ ] AC12.8: Screenshot E2E at 320, 768, and 1440 CSS pixels proves no horizontal page overflow and keeps the paused notice, main screen, modal controls, error copy, wallet identifier, media preview, and legal acknowledgement inside the viewport.
- [ ] AC12.9: Refresh and navigation tests prove the client restores canonical server state, aborts stale requests, never trusts localStorage for payment or admin truth, and renders conflict or recovery data returned after an interrupted confirmation.
- [ ] AC12.10: The production build reports the main page first-load JavaScript at or below 250 kB and no route exceeds the committed route budget; the budget check fails when a test fixture raises either threshold.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run build`
- `cd web && npm run test:e2e`

## Evidence required in transcript

- Show the production component line-count command and the component ownership map.
- Show the state-machine transition matrix, duplicate-submit test, and typed-envelope malformed-response test.
- Show the payment-disabled E2E spies with zero quote, RPC, signing, and confirmation calls.
- Show zero-match source, built-bundle, rendered-copy, and telemetry test output for the maintained sensitive-data and unsupported-claims fixtures.
- Show the accessibility summary and keyboard-flow test output.
- Show screenshots at 320, 768, and 1440 widths plus the automated overflow assertions.
- Show the production build route-size lines and route-budget check result.
- Print a criterion table for AC12.1 through AC12.10 with `pass` and one concrete file, route, screenshot, or test reference per row.

## Notes

Keep the existing visual identity unless accessibility requires a token change. Do not enable payments to exercise UI tests; inject explicit test fixtures behind test-only configuration. Do not hide legal acknowledgements or imply that a queued reward or NFT has been sent.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
