import { describe, expect, it } from "vitest";

import { AUCTION_MANIFEST_V1, getCrownPriceCents } from "@/lib/auction-manifest";

describe("KOTS 100 King auction manifest", () => {
  it("has exactly 100 fixed prices totalling $1,250,000", () => {
    expect(AUCTION_MANIFEST_V1.pricesUsdCents).toHaveLength(100);
    expect(AUCTION_MANIFEST_V1.pricesUsdCents.reduce((sum, price) => sum + price, 0)).toBe(125_000_000);
  });

  it.each([
    [1, 200],
    [9, 1_000],
    [10, 1_500],
    [26, 9_500],
    [27, 10_000],
    [50, 92_125],
    [100, 11_503_968],
  ])("uses the approved price for King #%d", (ordinal, expectedCents) => {
    expect(getCrownPriceCents(ordinal)).toBe(expectedCents);
  });

  it("rejects a number outside the limited series", () => {
    expect(() => getCrownPriceCents(0)).toThrow("CROWN_ORDINAL_OUT_OF_RANGE");
    expect(() => getCrownPriceCents(101)).toThrow("CROWN_ORDINAL_OUT_OF_RANGE");
  });
});
