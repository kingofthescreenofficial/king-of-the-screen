import { describe, expect, it } from "vitest";
import { buildPrelaunchDisplay } from "@/lib/prelaunch-display";

describe("buildPrelaunchDisplay", () => {
  it("keeps every pre-launch reward and payment mechanism disabled", () => {
    expect(buildPrelaunchDisplay()).toMatchObject({
      mode: "PRE_LAUNCH",
      paymentStatus: "TAKEOVERS PAUSED",
      walletStatus: "WALLET CONNECTION DISABLED",
      nftStatus: "NFT MINTING DISABLED",
      kotsStatus: "KOTS CLAIMS DISABLED",
      currentKing: null,
      history: [],
      screen: {
        title: "THE SCREEN IS WAITING",
        message: "No public crown record has been published.",
      },
      nft: {
        status: "ARCHIVAL NFT STATUS: PAUSED",
        ordinal: null,
      },
    });
  });
});
