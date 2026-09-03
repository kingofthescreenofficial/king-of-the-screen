# Repository map

## Live application

- `web/app/page.tsx`: main public page and polling orchestration.
- `web/components/TakeoverModal.tsx`: wallet payment, content submission and takeover flow. It is oversized and owns several unrelated concerns.
- `web/components/TheScreen.tsx`: active content rendering.
- `web/components/HallOfFame.tsx`: reign history.
- `web/components/LegalModal.tsx`: legal copy embedded in application code.
- `web/components/TelemetryTracker.tsx`: client telemetry.
- `web/components/WalletContextProvider.tsx`: Solana wallet adapters and provider setup.
- `web/app/admin/page.tsx`: browser-only password gate and operational controls.

## API surface

- `web/app/api/state/route.ts`: public auction state.
- `web/app/api/takeover/route.ts`: transaction verification and leader mutation.
- `web/app/api/upload/route.ts`: upload and moderation.
- `web/app/api/telemetry/route.ts`: telemetry ingestion and destructive log endpoint.
- `web/app/api/admin/dashboard/route.ts`: operational data exposed without server authentication.
- `web/app/api/admin/takedown/route.ts`: emergency state mutation with an unsafe fallback secret.
- `web/app/api/nft/[id]/route.ts`: NFT metadata.
- `web/app/api/nft/[id]/image/route.ts`: NFT image generation.

## Domain and persistence

- `web/lib/state.ts`: mutable global auction state and `/tmp/state.json` backup.
- `web/lib/blockchain.ts`: Solana/EVM verification helpers with insufficient payment checks.
- `web/lib/moderation.ts`: content checks and external moderation calls.
- `web/lib/types.ts`: shared state types.
- `web/data/state.json`: development seed/state artifact.
- `analytics/*.jsonl`: telemetry, queue and processed-event files.

## Workers and deployment

- `airdrop_sentinel.js`: background NFT/reward worker. It records work as processed even after some failures and treats the token reward as a manual placeholder.
- `scripts/complete_deployment.js`: legacy deployment helper.
- Numerous root `patch_*`, `fix*`, simulation and one-off scripts: operational history mixed with production source.
- `KOTS_MASTER_BLUEPRINT.md`, `README.md`, `PROJECT_MY_BIG_HANDOFF.md`: architecture and handoff documents that do not fully match the running implementation.

## Existing smart-contract material

- `contracts/KingGenesisNFT.sol` and `contracts/KingToken.sol` are EVM artifacts and are not the authority for the live Solana auction.
- `web/lib/compiled_contracts.json` and root compile/deploy scripts are legacy surfaces.

## Main trust boundaries

1. Browser wallet to Solana transaction.
2. Public API to payment verifier and auction state.
3. Upload input to public rendering.
4. Admin browser to privileged API.
5. Web process to durable storage.
6. Sentinel to hot wallet, NFT minting and reward records.
7. Nginx and SSH to the public VPS.

## Confirmed critical defects

- A transaction signature can be claimed by another caller because it is published to unauthenticated telemetry before takeover confirmation.
- Solana verification does not enforce sender, exact total, both recipients, the 80/20 split, transaction success, freshness or a server-issued intent.
- EVM verification accepts an unused hash without an on-chain lookup.
- Replay protection and auction state do not survive process topology and restart safely.
- Admin authentication is client-side. Dashboard data and destructive telemetry operations lack server authorization.
- Content moderation occurs after irreversible payment.
- The worker lacks durable leases, bounded retries, a dead-letter state and proof-backed token delivery.
- Production privileges, port exposure, file permissions and SSH policy exceed operational need.
