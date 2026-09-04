export function isPaidTakeoverEnabled(): boolean {
  return process.env.PAID_TAKEOVER_ENABLED === "true";
}

function hasFinalKotsMint(): boolean {
  return Boolean(process.env.KOTS_V12_MINT_ADDRESS?.trim());
}

function isKotsMechanicsEnabled(): boolean {
  return process.env.KOTS_MECHANICS_ENABLED === "true" && hasFinalKotsMint();
}

export function getPublicCapabilities() {
  return {
    paidTakeoverEnabled: isPaidTakeoverEnabled(),
    nftMintEnabled: false,
    kotsClaimEnabled: false,
    kotsMarketOperationsEnabled: false,
    kotsMechanicsPlanned: isKotsMechanicsEnabled(),
  };
}
