import { afterEach, describe, expect, it } from "vitest";

import { getPublicCapabilities, isAuctionSettlementEnabled, isPublicCrownArchiveEnabled, isStagingMode } from "@/lib/feature-flags";

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

  it("keeps the public crown archive closed without a separate approval", () => {
    delete process.env.PUBLIC_CROWN_ARCHIVE_ENABLED;
    expect(isPublicCrownArchiveEnabled()).toBe(false);

    process.env.PUBLIC_CROWN_ARCHIVE_ENABLED = "true";
    expect(isPublicCrownArchiveEnabled()).toBe(true);
  });

  it("allows the staging console only for an explicit devnet runtime", () => {
    process.env.KOTS_RUNTIME_MODE = "staging";
    process.env.SOLANA_CLUSTER = "mainnet-beta";
    expect(isStagingMode()).toBe(false);

    process.env.SOLANA_CLUSTER = "devnet";
    expect(isStagingMode()).toBe(true);
  });
});
