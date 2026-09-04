export const KOTS_CROWN_REWARD_PER_KING = 1_000_000;
export const KOTS_CROWN_COUNT = 100;
export const KOTS_CROWN_CLAIM_INITIAL_SHARE = 0.25;
export const KOTS_CROWN_CLAIM_VESTING_MONTHS = 12;

export const KOTS_TOKENOMICS_V12 = Object.freeze({
  version: "kots-v1.2",
  status: "PLANNED" as const,
  totalSupply: 1_000_000_000,
  decimals: 6,
  mintAddress: null,
  allocations: Object.freeze({
    crownRewards: 100_000_000,
    communityUtility: 400_000_000,
    productTreasury: 300_000_000,
    teamVesting: 200_000_000,
  }),
});

export type CrownClaimSchedule = {
  unlockedKots: number;
  remainingKots: number;
};

export function getCrownClaimSchedule(monthsSinceClaimOpening: number): CrownClaimSchedule {
  const elapsedMonths = Math.min(KOTS_CROWN_CLAIM_VESTING_MONTHS, Math.max(0, monthsSinceClaimOpening));
  const initialKots = KOTS_CROWN_REWARD_PER_KING * KOTS_CROWN_CLAIM_INITIAL_SHARE;
  const vestedKots = (KOTS_CROWN_REWARD_PER_KING - initialKots) * (elapsedMonths / KOTS_CROWN_CLAIM_VESTING_MONTHS);
  const unlockedKots = Math.round(initialKots + vestedKots);

  return {
    unlockedKots,
    remainingKots: KOTS_CROWN_REWARD_PER_KING - unlockedKots,
  };
}
