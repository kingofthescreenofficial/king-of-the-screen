SUPERGOAL_PHASE_START
Phase: 9 of 16 — Harden content ingestion
Task: Validate, normalize, moderate, bind, store, and serve user content safely before any payment intent exists.
Type: brownfield, backend, uploads, moderation, security, ui
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run build, cd web && npm run test:e2e
Acceptance criteria: 10
Evidence required: malicious fixture matrix, moderation fail-closed test, digest-binding test, storage proof, content E2E
Depends on phases: 4, 5, 8

## Why

Content must pass enforceable server checks before the user reaches an irreversible payment step, and the approved bytes must be the bytes later displayed.

## Work

- Replace ad hoc request parsing with schemas for nickname, tagline, destination link, media upload, and content revision. Normalize Unicode, trim fields, enforce explicit byte and character limits, and return stable typed errors.
- Accept only server-approved raster formats. Inspect magic bytes and fully decode the image instead of trusting filename or `Content-Type`; reject SVG, HTML, polyglots, truncated data, decompression bombs, excessive pixel dimensions, and animated input that exceeds configured frame or duration limits.
- Re-encode approved images with bounded dimensions and quality, strip metadata, compute a SHA-256 digest, and store bytes outside the public source tree under a generated content identifier. Do not persist base64 data URIs in application state.
- Treat the promotional destination link separately from media. Permit only normalized `https:` URLs with bounded length; reject credential-bearing URLs and unsafe schemes. Render links with `noopener`, `noreferrer`, `nofollow`, and `ugc` protections.
- Disable arbitrary remote-media embedding. If remote-media import remains a product requirement, route it through a server fetcher that re-checks DNS on every redirect, blocks private, loopback, link-local, metadata, and non-HTTP targets, caps bytes and time, then applies the same decoder and re-encoder.
- Persist a versioned content submission lifecycle such as `draft`, `pending_moderation`, `approved`, `rejected`, and `moderation_error`, including policy version, decision source, reason code, timestamps, and operator overrides.
- Run local text checks and configured image moderation before phase 5 can issue an intent. Timeout, provider error, missing required provider configuration, or malformed provider output must fail closed into a retryable non-approved state.
- Bind the approved content revision ID and digest into the payment intent. Any later content-field or media-byte change creates a new revision and prevents use of the old approval or intent.
- Serve only approved content referenced by a valid public reign through a bounded content route with explicit MIME type, `X-Content-Type-Options: nosniff`, CSP-compatible headers, and stable cache behavior. Never derive a filesystem path from user input.
- Add authenticated moderation review and cleanup tasks. Operator decisions require a reason and audit event; cleanup removes expired orphan or rejected blobs but preserves content referenced by active intents, payments, recoveries, reigns, or NFT metadata.

## Acceptance criteria (all must pass — verify each in transcript)

- [ ] AC9.1: Schema tests reject over-limit text, invalid Unicode control input, credential-bearing links, and every scheme except normalized `https:`, while accepted values are stored in canonical form.
- [ ] AC9.2: A malicious upload fixture matrix proves the server rejects spoofed MIME, SVG or HTML, polyglots, truncated files, excessive dimensions, decompression bombs, and over-limit animation before durable approval.
- [ ] AC9.3: A valid image test proves output bytes are re-encoded within configured dimensions, metadata is absent, SHA-256 matches the stored blob, the database stores a content ID rather than a data URI, and the blob path is outside `public/`.
- [ ] AC9.4: Production code contains no direct rendering of arbitrary remote media; any retained import path has passing DNS-rebinding, redirect, private-address, byte-limit, timeout, and decoder tests.
- [ ] AC9.5: Moderation runs before intent creation, and tests prove rejected, pending, timed-out, provider-error, missing-provider, and malformed-provider submissions cannot receive an intent or reach a wallet-signing state.
- [ ] AC9.6: Editing any approved text field or one media byte changes the revision digest, invalidates the old approval for checkout, and requires a newly approved revision and newly issued intent.
- [ ] AC9.7: The public content route returns only a blob referenced by an approved public reign, supplies the expected MIME, nosniff, and cache headers, and returns a generic 404 for rejected, orphaned, traversal, and unknown identifiers.
- [ ] AC9.8: Rendered promotional links include `noopener noreferrer nofollow ugc`, open no `javascript:` or `data:` target, and display a safe fallback when the stored URL is absent or invalid.
- [ ] AC9.9: Authenticated approve, reject, and retry actions each require a valid CSRF token and bounded reason, create one redacted audit event, and cannot mutate content attached to a completed reign.
- [ ] AC9.10: Content E2E covers one valid upload through approval preview plus invalid-type, oversize, moderation-rejected, and provider-unavailable states; every path proves paid takeover stays disabled and no wallet transaction request occurs.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run build`
- `cd web && npm run test:e2e`

## Evidence required in transcript

- Show the malicious fixture matrix with fixture name, expected rejection code, actual result, and zero approved rows.
- Show one sanitized image's input and output dimensions, stripped metadata result, digest match, and non-public storage path without dumping image bytes.
- Show the moderation fail-closed test matrix and the intent-row count of zero for each non-approved state.
- Show the before-and-after digest binding test and old-intent rejection.
- Show content-route response headers plus traversal and rejected-content results.
- Show the content E2E summary and responsive preview screenshots without private moderation credentials.
- Print a criterion table for AC9.1 through AC9.10 with `pass` and one concrete file, fixture, route, or test reference per row.

## Notes

Moderation is a product control, not a guarantee that all prohibited material is caught. Store minimal decision metadata and avoid retaining rejected content longer than the configured review or appeal window. Do not create an intent for content that lacks a current approval.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
