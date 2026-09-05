export interface PrelaunchDisplay {
  mode: "PRE_LAUNCH";
  paymentStatus: "TAKEOVERS PAUSED";
  walletStatus: "WALLET CONNECTION DISABLED";
  nftStatus: "NFT MINTING DISABLED";
  kotsStatus: "KOTS CLAIMS DISABLED";
  currentKing: null;
  history: readonly [];
  screen: {
    title: "THE SCREEN IS WAITING";
    message: "No public crown record has been published.";
  };
  nft: {
    status: "ARCHIVAL NFT STATUS: PAUSED";
    ordinal: null;
  };
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
    screen: {
      title: "THE SCREEN IS WAITING",
      message: "No public crown record has been published.",
    },
    nft: {
      status: "ARCHIVAL NFT STATUS: PAUSED",
      ordinal: null,
    },
  };
}
