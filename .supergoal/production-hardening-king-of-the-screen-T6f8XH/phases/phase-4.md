SUPERGOAL_PHASE_START
Phase: 4 of 16 — Build durable persistence
Task: Replace memory and JSONL authority with transactional SQLite WAL repositories and migration scripts.
Type: brownfield, data, backend
Mandatory commands: cd web && npm run lint, cd web && npm run typecheck, cd web && npm test, cd web && npm run test:coverage, cd web && npm run build
Acceptance criteria: 11
Evidence required: schema listing, migration output, repository tests, import test, command summaries
Depends on phases: 1, 2

## Why

Auction and reward state must survive process restarts and enforce uniqueness.

## Work

- Add SQLite WAL connection management with env-configurable database path.
- Enable foreign keys, a bounded busy timeout and immediate write transactions so the web process and worker safely contend for one database file.
- Add migrations for settings, auction state, payment intents, payments, reigns, content submissions, terms acceptances, admin sessions, audit events, reward jobs, NFT mints and telemetry.
- Add repository interfaces and concrete SQLite implementations.
- Add transaction helper with immediate write transactions for settlement paths.
- Add legacy import from `/tmp/state.json` and existing analytics JSONL files into durable tables.
- Add local backup and restore scripts that operate without exposing secrets.
- Add integration tests for migrations, constraints, import and rollback behavior.

## Acceptance criteria (all must pass — verify each in transcript)

- Database initializes in WAL mode and reports the expected journal mode.
- Database connections enforce foreign keys and a documented busy timeout, and a two-process fixture proves the second writer waits or returns a typed busy result instead of corrupting state.
- All listed tables exist with primary keys and created/updated timestamps where relevant.
- Unique constraints exist for payment signatures, intent ids, reign ids and reward job idempotency.
- Repository tests cover create, read, update and transactional rollback.
- Legacy state import is idempotent.
- JSONL telemetry import redacts sensitive fields.
- Backup script creates a restorable database artifact.
- Restore test proves the app can read restored auction state.
- File-backed global state is no longer the source of truth for new writes.
- Production database path is configurable through environment.

## Mandatory commands (run each, surface last ~10 lines + exit code)

- `cd web && npm run lint`
- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run test:coverage`
- `cd web && npm run build`

## Evidence required in transcript

- Migration command output.
- Table and index listing.
- Repository test summary.
- Backup and restore test summary.

## Notes

Keep the storage boundary portable enough for a later PostgreSQL migration.

---

The agent will, during execution, print SUPERGOAL_PHASE_START (above),
do the work, then print SUPERGOAL_PHASE_VERIFY, MEMORY_SAVED, and
SUPERGOAL_PHASE_DONE in order. On failure, the agent follows the
3-strike recovery protocol in .supergoal/production-hardening-king-of-the-screen-T6f8XH/PROTOCOL.md without further
instruction needed here.
