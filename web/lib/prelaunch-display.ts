export interface PrelaunchDisplay {
  mode: "PRE_LAUNCH";
  paymentStatus: "TAKEOVERS PAUSED";
  walletStatus: "WALLET CONNECTION DISABLED";
  nftStatus: "NFT MINTING DISABLED";
  kotsStatus: "KOTS CLAIMS DISABLED";
  currentKing: null;
  history: readonly [];
}

export function buildPrelaunchDisplay(): PrelaunchDisplay {
  return {
    mode: "PRE_LAUNCH",
    paymentStatus: "TAKEOVERS PAUSED",
    walletStatus: "WALLET CONNECTION DISABLED",
    nftStatus: "NFT MINTING DISABLED",
    kotsStatus: "KOTS CLAIMS DISABLED",
    currentKing: null,
    history: [],
  };
}
