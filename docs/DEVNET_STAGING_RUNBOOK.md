# Devnet Staging Runbook

## Purpose

This runbook validates the browser flow without mainnet value movement. It prepares an unsigned devnet transaction with an 80/20 split, requests an optional Phantom signature, and records an NFT queue preview. It does not broadcast a transaction, mint an NFT, or send an NFT.

## Required configuration

1. Copy `web/.env.staging.example` to `web/.env.local` in an isolated local checkout.
2. Set `KOTS_RUNTIME_MODE=staging` and `SOLANA_CLUSTER=devnet`.
3. Set both recipient addresses to public devnet test addresses. Never use mainnet private keys, seed phrases, or production RPC credentials.
4. Start the app with `npm run dev` from `web`.
5. Open `http://localhost:3000/staging` in a browser with Phantom set to Solana devnet.

## Expected flow

1. Connect Phantom.
2. Enter a display name and message.
3. Select `PREPARE 80/20 PREVIEW`.
4. Confirm that the preview shows 80% for Treasury and 20% for Operations.
5. Select `SIGN DEVNET PREVIEW` only if you want to test Phantom signing.
6. Confirm that Phantom returns to the site and no transaction signature is broadcast.
7. Select `QUEUE NFT PREVIEW` to record a `STAGING_PREVIEW` job.

## Stop conditions

- `/staging` appears on the public production domain.
- `SOLANA_CLUSTER` is not `devnet`.
- Any production payment, settlement, NFT mint, KOTS, or Sentinel flag is true.
- The UI asks for a private key or seed phrase.

If any stop condition occurs, set `KOTS_RUNTIME_MODE=prelaunch`, restart `kots-web`, and keep `kots-sentinel` stopped.
