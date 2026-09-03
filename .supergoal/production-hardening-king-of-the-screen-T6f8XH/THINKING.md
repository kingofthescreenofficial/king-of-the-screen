# Thinking: production hardening

## Goals

1. Prevent free, underpaid, replayed or stolen takeover claims.
2. Make auction, payment, moderation and reward state durable and transactional.
3. Replace browser-only administration with authenticated, audited server controls.
4. Make failures recoverable without losing paid transactions or duplicating rewards.
5. Reduce dependencies and establish repeatable lint, test, build and deployment gates.
6. Harden the single VPS, deploy a payment-paused release and prove rollback.

## Constraints

- The current VPS has one CPU and about 1 GB RAM.
- Payments are irreversible. A transaction that lands on-chain must never disappear because an API call races or crashes.
- No audited custom Solana program exists. This code phase will not introduce one.
- The $KOTS market-buy promise has legal and execution risk. Automated buying stays disabled until the legal phase approves it.
- Existing production data needs a migration path and a reversible deployment.
- Private keys and service credentials must stay out of Git, logs, client bundles and planning artifacts.

## Risks

1. **Payment theft or invalid acceptance, likelihood high.** A public signature and weak verification currently let a caller claim value they did not send. Mitigation: short-lived server intents, wallet proof, exact instruction parsing, two-recipient checks, memo binding, finality, freshness and durable uniqueness constraints.
2. **Paid-user loss during races, likelihood high.** Direct transfers and file-backed state have no atomic settlement. Mitigation: exclusive short reservation, database transaction, compare-and-swap price version and a recovery queue for late but valid transactions.
3. **Server or key compromise, likelihood high.** Root services, direct app-port exposure, broad file permissions and weak SSH policy enlarge the blast radius. Mitigation: dedicated users, least-privilege files, loopback binding, firewall, fail2ban, key-only SSH, secret rotation and staged rollback checks.

## Dependencies

- The test harness precedes security refactors so current behavior and rejection cases remain measurable.
- Durable schema and repositories precede payment intents, atomic settlement, admin sessions and durable workers.
- Payment intents precede strict transaction confirmation.
- Strict verification precedes auction settlement and recovery handling.
- Admin authentication precedes exposing reward or moderation controls.
- Production packaging precedes VPS hardening and deployment.
- Legal approval and owner activation follow this code run. They are required before paid checkout is enabled.

## Assumptions

- Use SQLite in WAL mode for the present single-node, low-traffic VPS. Its repository boundary and SQL migrations will keep a later PostgreSQL move bounded. Unique constraints and immediate transactions enforce correctness.
- Keep a short-lived exclusive checkout reservation. Require a wallet-signed challenge before reservation creation to limit reservation abuse.
- A valid transaction received after reservation expiry enters an operator-visible recovery state. It is never silently discarded.
- Keep the existing brand and public page structure while splitting oversized components and removing misleading status copy.
- Deploy with `PAID_TAKEOVER_ENABLED=false`. Legal approval and a separate owner action are required to enable payments.
- Build encrypted local backup and restore automation now. Production activation also requires an off-host backup destination or verified provider snapshots.
- Implement $KOTS rewards as proof-backed manual jobs first. Record verified token transfer signatures and actual amounts. Do not execute automated market buys in this run.

## Open questions treated as launch gates

- Off-host backup provider credentials are not supplied. The deploy can remain payment-paused until a target is configured and a restore test passes.
- Existing hot-wallet and RPC credentials were exposed in operational material. Rotation is required during staged server hardening, without printing secret values.

## Best practices applied

- Treat the server database as the single authority. Treat client totals and status labels as untrusted.
- Use immutable domain values, schema validation at every boundary and uniform error envelopes.
- Use idempotency keys, unique constraints and transactions instead of in-memory replay sets.
- Premoderate content before payment and persist a content digest in the payment intent.
- Separate transaction observation, auction settlement, reward fulfillment and UI messaging.
- Run services without root, expose the app only through Nginx and retain rollback artifacts.
- Require automated unit, integration and E2E checks plus manual production smoke evidence.
