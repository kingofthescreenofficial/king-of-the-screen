import { AUCTION_MANIFEST_V1, getCrownPriceCents } from "./auction-manifest";

export { AUCTION_MANIFEST_V1, getCrownPriceCents };

export function calculateNextPrice(currentPriceUsd: number): number {
  const currentCents = Math.round(currentPriceUsd * 100);
  const ordinal = AUCTION_MANIFEST_V1.pricesUsdCents.indexOf(currentCents) + 2;
  if (ordinal < 2 || ordinal > AUCTION_MANIFEST_V1.crownLimit) return currentPriceUsd;
  return getCrownPriceCents(ordinal) / 100;
}
