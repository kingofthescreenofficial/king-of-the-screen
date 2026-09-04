const CROWN_LIMIT = 100;
const WHALE_ZONE_FACTOR = 1.1013603059940036;

function createPricesUsdCents(): readonly number[] {
  const prices = Array.from({ length: CROWN_LIMIT }, (_, index) => {
    const ordinal = index + 1;
    if (ordinal <= 9) return (ordinal + 1) * 100;
    if (ordinal <= 26) return (ordinal - 7) * 500;
    return Math.round(10_000 * WHALE_ZONE_FACTOR ** (ordinal - 27));
  });

  return Object.freeze(prices);
}

export const AUCTION_MANIFEST_V1 = Object.freeze({
  version: "kots-100-v1",
  crownLimit: CROWN_LIMIT,
  pricesUsdCents: createPricesUsdCents(),
  grossRevenueUsdCents: 125_000_000,
});

export function getCrownPriceCents(ordinal: number): number {
  if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > AUCTION_MANIFEST_V1.crownLimit) {
    throw new Error("CROWN_ORDINAL_OUT_OF_RANGE");
  }

  return AUCTION_MANIFEST_V1.pricesUsdCents[ordinal - 1];
}
