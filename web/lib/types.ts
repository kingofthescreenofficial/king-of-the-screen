export interface King {
  id: string;
  nickname: string;
  tagline: string;
  link?: string;
  mediaUrl: string;
  mediaType: "image" | "gif";
  paidAmountUsd: number;
  paidCryptoAmount?: number;
  cryptoCurrency: "SOL" | "USDT" | "ETH" | "DEMO";
  crownedAt: number; // Unix timestamp ms
  dethronedAt?: number; // Unix timestamp ms
  reignDurationSeconds?: number;
  txHash?: string;
  countryCode?: string;
  rewardWalletAddress?: string;
  airdropStatus?: "QUEUED" | "DELIVERED" | "SENT";
  minedTokens?: number;
}

export interface TokenConfig {
  ticker: string;
  name: string;
  contractAddress: string;
  pumpFunUrl: string;
  dexScreenerUrl: string;
  totalSupply: number;
}

export interface AppState {
  currentKing: King;
  nextMinPriceUsd: number;
  stats: {
    totalRaisedUsd: number;
    totalDethronements: number;
    longestReignSeconds: number;
    longestReignKing: string;
    targetGoalUsd: number;
  };
  hallOfFame: King[]; // List of past kings
  recentEvents: Array<{
    id: string;
    type: "TAKEOVER" | "BID_ATTEMPT" | "CHAT";
    text: string;
    timestamp: number;
  }>;
  walletConfig: {
    solanaAddress: string;
    evmAddress: string;
    usdtTrc20Address: string;
  };
  tokenConfig?: TokenConfig;
}

export interface PublicAppState extends AppState {
  capabilities: {
    paidTakeoverEnabled: boolean;
  };
}
