# Mobile Devnet Staging

## Purpose

Test the isolated staging flow from Phantom on a phone. The test has no mainnet payment, transaction broadcast, NFT mint, KOTS operation, or public staging route.

## HTTPS requirement

Phantom injects its Solana provider in its mobile in-app browser on HTTPS pages, `localhost`, or `127.0.0.1`. A phone cannot use a Mac's HTTP LAN address for this test.

## Required controlled test endpoint

Use a temporary HTTPS tunnel to the local staging process. Protect the tunnel with an access gate. Do not use the production domain, do not set the VPS to staging, and do not publish the tunnel URL.

Before a tunnel starts, confirm all controls:

- `KOTS_RUNTIME_MODE=staging`
- `SOLANA_CLUSTER=devnet`
- payment, settlement, NFT mint, KOTS, public archive, and public content flags are `false`
- a local environment check reports `Payments: disabled`
- the recipient addresses are public devnet test addresses

## Phone test

1. Switch Phantom to Solana Devnet.
2. Add test SOL through a devnet faucet. Do not send mainnet SOL.
3. Open the protected HTTPS tunnel URL in Phantom's in-app browser.
4. Use the `/staging/access?token=[STAGING_ACCESS_TOKEN]` entry URL once. It stores a 30-minute HttpOnly session.
5. Connect Phantom.
6. Submit content for review.
7. Review the unsigned 80/20 devnet transaction.
8. Sign only the devnet preview.
9. Confirm that no transaction is broadcast and no NFT is minted or delivered.
10. Close the tunnel after the test.
