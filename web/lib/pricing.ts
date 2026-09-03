export function calculateNextPrice(currentPriceUsd: number): number {
  if (currentPriceUsd < 10) {
    return currentPriceUsd + 1;
  }

  if (currentPriceUsd < 100) {
    return currentPriceUsd + 5;
  }

  return Math.round(currentPriceUsd * 1.1);
}
