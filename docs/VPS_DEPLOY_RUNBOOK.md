# VPS Deploy Runbook

## Scope

Deploy source code only. The server owns its own `.env.local`, database, uploads, analytics, and PM2 configuration.

## Required exclusions

Never synchronize these paths from a local checkout:

- `.env.local` and `.env*.local`
- `node_modules`
- `.next`
- `data`
- `analytics`
- browser test reports

## Deployment command

Run from `web` after local tests pass:

```sh
rsync -az \
  --exclude '.env.local' \
  --exclude '.env*.local' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'data' \
  --exclude 'analytics' \
  --exclude 'playwright-report' \
  --exclude 'test-results' \
  -e 'ssh -i /Users/aleksejsavcenko/.ssh/id_rsa' \
  ./ root@162.0.228.51:/var/www/king-of-the-screen/web/
```

Build and restart only the web process:

```sh
ssh -i /Users/aleksejsavcenko/.ssh/id_rsa root@162.0.228.51 \
  'cd /var/www/king-of-the-screen/web && npm run build && pm2 restart kots-web && pm2 stop kots-sentinel'
```

## Post-deploy checks

Confirm that the public home page returns `200`, `/staging` returns `404`, staging APIs return `404`, and `/api/payment-intents` returns `503`.
