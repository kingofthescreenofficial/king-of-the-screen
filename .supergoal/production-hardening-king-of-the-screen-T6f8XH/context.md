# Context: King of the Screen production hardening

## Repository

- Brownfield public repository on branch `codex/production-hardening`.
- Baseline commit: `10b855fbe7a60a00ffaf9cac77afc02bf34f7188`.
- Application root: `web/`.
- Production currently runs from a manually synchronized copy on one Ubuntu VPS.
- Source and production are frozen for inspection. No production mutation has been made during planning.

## Stack

- Next.js 15 App Router with React 19 and TypeScript 5.7.
- Tailwind CSS 3.
- Solana Web3.js plus Solana wallet adapters.
- File-backed state, telemetry and background queues.
- PM2 runs the web application and a Node.js Sentinel worker.
- Nginx terminates TLS and proxies to the Next.js process.

## Package manager and commands

- Package manager: npm, with `web/package-lock.json` as the application lockfile.
- Existing build: `cd web && npm run build`.
- Existing typecheck: `cd web && npx tsc --noEmit`.
- Existing lint command is broken because `next lint` opens an interactive setup prompt.
- No configured unit, integration or E2E test runner exists.

## Baseline results

- `npm ci`: pass.
- `npm run build`: pass with dependency and workspace-root warnings.
- `npx tsc --noEmit`: pass.
- `npm run lint`: fail because the command is interactive and obsolete for this setup.
- `npm audit --omit=dev`: 96 production advisories, including 1 critical and 11 high.
- Build generated a tracked change in `web/tsconfig.tsbuildinfo`; phase 1 removes this generated artifact from source control.

## Production environment

- Ubuntu 24.04, Node.js 20, one CPU, about 1 GB RAM and 2 GB swap.
- No PostgreSQL or container runtime is installed.
- Both PM2 processes currently run as root.
- The application port is reachable directly from the internet instead of only through Nginx.
- SSH permits root and password authentication. Firewall and fail2ban are absent.
- Sensitive files have permissions that are broader than required.
- No verified off-host state backup exists.

## Scope for this run

This run completes code, data, security and deployment hardening. It deploys a payment-paused release. Legal review is a separate second part of the parent goal. Paid checkout stays disabled until that legal part passes and the owner explicitly approves activation.
