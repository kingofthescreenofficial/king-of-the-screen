import { afterEach, describe, expect, it } from "vitest";

import {
  LIVE_MICROTEST_ACCESS_COOKIE,
  LIVE_MICROTEST_AMOUNT_USD_CENTS,
  hasLiveMicrotestAccessFromCookieHeader,
  hasValidLiveMicrotestAccess,
  isLiveMicrotestEnabled,
} from "@/lib/live-microtest";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("private live microtest", () => {
  it("requires an explicit mainnet-only switch and exact access token", () => {
    process.env.LIVE_MICROTEST_ENABLED = "true";
    process.env.SOLANA_CLUSTER = "devnet";
    process.env.LIVE_MICROTEST_ACCESS_TOKEN = "test-token";

    expect(isLiveMicrotestEnabled()).toBe(false);
    process.env.SOLANA_CLUSTER = "mainnet-beta";
    expect(isLiveMicrotestEnabled()).toBe(true);
    expect(hasValidLiveMicrotestAccess("wrong-token")).toBe(false);
    expect(hasLiveMicrotestAccessFromCookieHeader(`${LIVE_MICROTEST_ACCESS_COOKIE}=test-token`)).toBe(true);
  });

  it("caps the actual transfer below one dollar to leave a network-fee buffer", () => {
    expect(LIVE_MICROTEST_AMOUNT_USD_CENTS).toBe(95);
    expect(LIVE_MICROTEST_AMOUNT_USD_CENTS).toBeLessThan(100);
  });
});
