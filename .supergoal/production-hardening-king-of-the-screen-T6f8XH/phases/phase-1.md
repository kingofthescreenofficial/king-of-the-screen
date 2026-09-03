SUPERGOAL_PHASE_START
Phase: 1 of 16 — Establish engineering baseline
Task: Create deterministic local and CI quality gates before changing production behavior.
Type: testing, tooling, ci, baseline
Mandatory commands: cd web && npm ci, cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run test:e2e, cd web && npm run build, test ! -e web/tsconfig.tsbuildinfo && git check-ignore -q web/tsconfig.tsbuildinfo
Acceptance criteria: 12
Evidence required: package scripts and configuration excerpts, CI workflow excerpt, lint/typecheck/test/build exit codes, coverage summary, E2E summary, clean generated-file check
Depends on phases: none
Cleanliness override: The run protocol is added as a planning artifact and contains literal debug-pattern names only. Runtime source and tests added in this phase contain no debug logging or session TODO/FIXME markers.

## Why

The security and data refactor needs repeatable checks that fail without prompts and protect existing behavior on every clean checkout.

## Work

- Replace the obsolete interactive lint script with a deterministic ESLint setup for Next.js 15.
- Add `typecheck`, `test`, `test:coverage` and `test:e2e` scripts in `web/package.json`.
- Add Vitest, Testing Library and Playwright configuration scoped to the current app, with 80 percent coverage thresholds for lines, statements, functions and branches.
- Add first unit, route integration, desktop E2E and mobile E2E characterization tests around public state, current form validation and read-only page rendering.
- Add a GitHub Actions workflow on Node.js 20 that installs from `web/package-lock.json` and runs the same commands as this plan.
- Remove generated `web/tsconfig.tsbuildinfo` from source control and ignore future build-info output.
- Resolve the multiple-lockfile workspace-root warning through explicit Next.js configuration or another documented non-destructive repository setting.
- Use temporary paths, deterministic time and injected service doubles so tests never call public RPC, pricing, moderation or wallet services.
- Preserve current app behavior. The payment pause and protected-route behavior begin in phase 2.

## Acceptance criteria (all must pass — verify each in transcript)

- `web/package.json` defines non-interactive `lint`, `typecheck`, `test`, `test:coverage` and `test:e2e` scripts, and each exits non-zero when its underlying check fails.
- ESLint runs without asking for input and checks every maintained JavaScript, TypeScript and TSX source file under `web/` while excluding generated output.
- Vitest discovers at least one unit test and at least one API or service integration test, and no test reaches a public network endpoint.
- Coverage enforcement is set to at least 80 percent for lines, statements, functions and branches, with exclusions limited to generated files and framework entry points.
- Playwright passes at least one desktop and one mobile-viewport smoke test against a locally started production build with paid actions disabled.
- The baseline suite asserts that the public state endpoint returns HTTP 200 with current crown and price fields, and that an empty takeover request returns a typed 400 error without changing state.
- GitHub Actions uses Node.js 20, runs `npm ci` from `web/package-lock.json`, and executes lint, typecheck, tests, coverage, E2E and build jobs.
- Test setup uses temporary directories, deterministic clocks or injected time and synthetic environment values removed after each test.
- `web/tsconfig.tsbuildinfo` is absent from the checkout, TypeScript build metadata is ignored, and typecheck plus build does not recreate a tracked file.
- A clean build emits no Next.js warning about selecting the wrong workspace root from multiple lockfiles.
- No secret-shaped value, private key material, production API token or production admin credential exists in test fixtures, workflow files or committed environment examples.
- Every mandatory command exits with code 0 after the fresh install, and the final generated-file diff check is empty.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm ci`
- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run test:e2e`
- `cd web && npm run build`
- `test ! -e web/tsconfig.tsbuildinfo && git check-ignore -q web/tsconfig.tsbuildinfo`

## Evidence required in transcript

- Show the final scripts block and relevant ESLint, Vitest, coverage and Playwright configuration excerpts.
- Show the GitHub Actions job names, Node version and exact scripts.
- Show discovery and pass counts for unit, integration and both E2E viewports.
- Show all four coverage percentages and confirm every threshold passed.
- Show the last output lines and exit code for every mandatory command.
- Show `git status --short` after all gates and prove no generated tracked file changed.

## Notes

Do not change paid behavior in this phase. Do not add real service credentials or use a live wallet in E2E tests.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
