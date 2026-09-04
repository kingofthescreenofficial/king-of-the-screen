import { describe, expect, it } from "vitest";

import {
  KOTS_TOKENOMICS_V12,
  KOTS_CROWN_REWARD_PER_KING,
  getCrownClaimSchedule,
} from "@/lib/kots-tokenomics";

describe("KOTS v1.2 tokenomics", () => {
  it("has a fixed one billion KOTS supply with a 10% Crown Rewards reserve", () => {
    expect(KOTS_TOKENOMICS_V12.totalSupply).toBe(1_000_000_000);
    expect(KOTS_TOKENOMICS_V12.allocations.crownRewards).toBe(100_000_000);
    expect(KOTS_TOKENOMICS_V12.allocations.crownRewards).toBe(KOTS_CROWN_REWARD_PER_KING * 100);
  });

  it("allocates the full fixed supply without a hidden reserve", () => {
    expect(Object.values(KOTS_TOKENOMICS_V12.allocations).reduce((sum, amount) => sum + amount, 0))
      .toBe(KOTS_TOKENOMICS_V12.totalSupply);
  });

  it("releases 25% at claim opening and the balance over 12 months", () => {
    expect(getCrownClaimSchedule(0)).toEqual({ unlockedKots: 250_000, remainingKots: 750_000 });
    expect(getCrownClaimSchedule(6)).toEqual({ unlockedKots: 625_000, remainingKots: 375_000 });
    expect(getCrownClaimSchedule(12)).toEqual({ unlockedKots: 1_000_000, remainingKots: 0 });
  });
});
