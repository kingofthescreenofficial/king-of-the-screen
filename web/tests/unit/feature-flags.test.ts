import { afterEach, describe, expect, it } from "vitest";

import { getPublicCapabilities, isAuctionSettlementEnabled } from "@/lib/feature-flags";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("pre-launch capability flags", () => {
  it("keeps KOTS features disabled without a final mint and explicit approval", () => {
    delete process.env.KOTS_V12_MINT_ADDRESS;
    process.env.KOTS_MECHANICS_ENABLED = "true";

    expect(getPublicCapabilities()).toMatchObject({
      kotsClaimEnabled: false,
      kotsMarketOperationsEnabled: false,
      nftMintEnabled: false,
    });
  });

  it("does not enable KOTS features when only payments are approved", () => {
    process.env.PAID_TAKEOVER_ENABLED = "true";

    expect(getPublicCapabilities()).toMatchObject({
      paidTakeoverEnabled: true,
      kotsClaimEnabled: false,
      kotsMarketOperationsEnabled: false,
    });
  });

  it("requires a separate approval before settlement can run", () => {
    process.env.PAID_TAKEOVER_ENABLED = "true";
    delete process.env.AUCTION_SETTLEMENT_ENABLED;
    expect(isAuctionSettlementEnabled()).toBe(false);

    process.env.AUCTION_SETTLEMENT_ENABLED = "true";
    expect(isAuctionSettlementEnabled()).toBe(true);
  });
});
