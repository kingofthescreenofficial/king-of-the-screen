export function isPaidTakeoverEnabled(): boolean {
  return process.env.PAID_TAKEOVER_ENABLED === "true";
}

export function isAuctionSettlementEnabled(): boolean {
  return isPaidTakeoverEnabled() && process.env.AUCTION_SETTLEMENT_ENABLED === "true";
}

export function isPublicCrownArchiveEnabled(): boolean {
  return process.env.PUBLIC_CROWN_ARCHIVE_ENABLED === "true";
}

export function isContentSubmissionEnabled(): boolean {
  return isPaidTakeoverEnabled() && process.env.CONTENT_SUBMISSIONS_ENABLED === "true";
}

export function isStagingMode(): boolean {
  return process.env.KOTS_RUNTIME_MODE === "staging" && process.env.SOLANA_CLUSTER === "devnet";
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
