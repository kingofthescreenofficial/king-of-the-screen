# Detected tools and evidence sources

- Local shell and unrestricted read access for repository inspection, builds and tests.
- `apply_patch` for all source and artifact edits.
- Git for isolated branch work and baseline comparison.
- SSH for authorized VPS inspection and later staged deployment.
- Internet research through Agent Reach and the built-in web search when current primary documentation is required.
- Parallel agents for architecture, security, reward pipeline and operations reviews.
- Browser automation is available for final public and admin flow checks.
- Image inspection and screenshots are available for visual and responsive checks.
- MEMANTO commands are installed, but remote memory writes currently return an expired-subscription error. No secret will be written to memory.

## Planned verification tools

- ESLint for static linting.
- TypeScript compiler for type checks.
- Vitest and Testing Library for unit and integration tests.
- Playwright for critical E2E flows.
- Solana RPC fixtures plus deterministic transaction parsers for payment verification tests.
- npm audit and dependency inspection for supply-chain checks.
- Nginx, systemd/PM2, UFW, fail2ban and SSH diagnostic commands for the VPS.

## Primary documentation checked

- Next.js official self-hosting docs: standalone output creates a production folder containing only necessary files. Use this in the deployment packaging phase. Source: https://nextjs.org/docs/app/guides/self-hosting
- SQLite official WAL docs: WAL supports concurrent readers with one writer and is intended for smaller transactions. Use WAL plus short transactions, busy timeout and repository-level write boundaries. Source: https://www.sqlite.org/wal.html
- SQLite official locking docs: many processes can hold shared read locks, while write access is serialized. Use explicit transactions and avoid long write locks. Source: https://www.sqlite.org/lockingv3.html
- Metaplex official Token Metadata docs: `createV1` is the current helper for minting assets and creating metadata. Use Umi-based minting with durable job records. Source: https://www.metaplex.com/docs/smart-contracts/token-metadata/mint
- Metaplex official Umi plugin docs: Core is presented as the next-generation Solana NFT standard with a single-account design. Prefer Umi/Core if it fits wallet and marketplace needs, otherwise document why Token Metadata remains in use. Source: https://www.metaplex.com/docs/dev-tools/umi/metaplex-umi-plugins
- Solana official web3.js docs: use server-side transaction lookup and parsed transaction data for verification, not client-submitted totals. Source: https://solana-foundation.github.io/solana-web3.js/
