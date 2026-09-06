import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  fullyParallel: false,
  workers: 1,
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: `npm run build && PORT=${port} npm run start`,
    env: {
      ...process.env,
      KOTS_RUNTIME_MODE: "prelaunch",
      PAID_TAKEOVER_ENABLED: "false",
      AUCTION_SETTLEMENT_ENABLED: "false",
      NFT_MINT_ENABLED: "false",
      KOTS_MECHANICS_ENABLED: "false",
      PUBLIC_CROWN_ARCHIVE_ENABLED: "false",
      CONTENT_SUBMISSIONS_ENABLED: "false",
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
});
