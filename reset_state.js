const fs = require('fs');

const genesisState = {
  currentKing: {
    nickname: "👑 Sovereign Origin",
    tagline: "The world's most contested digital screen is LIVE. Dethrone me to rule!",
    link: "https://x.com",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    mediaType: "image",
    paidAmountUsd: 1,
    paidCryptoAmount: 0.005,
    cryptoCurrency: "SOL",
    txHash: "genesis_tx_001",
    countryCode: "🌐",
    id: `king_genesis_${Date.now()}`,
    crownedAt: Date.now(),
    rewardWalletAddress: "CC3SUMpNzWDMpAt2JxtYERohLmyHjj2GPxWscYXnW1Fo"
  },
  nextMinPriceUsd: 2,
  stats: {
    totalRaisedUsd: 1,
    totalDethronements: 1,
    longestReignSeconds: 1420,
    longestReignKing: "👑 Sovereign Origin",
    targetGoalUsd: 1000000,
  },
  hallOfFame: [],
  recentEvents: [
    {
      id: `ev-${Date.now()}`,
      type: "TAKEOVER",
      text: "👑 Sovereign Origin claimed the throne for $1.00 (SOL)!",
      timestamp: Date.now(),
    },
  ],
  walletConfig: {
    solanaAddress: process.env.SOLANA_WALLET_ADDRESS || "EkgfzyrqfTZB8Er3XPSYn6nVmtTv4hvCo3F9Drkd62Aq",
    evmAddress: process.env.EVM_WALLET_ADDRESS || "0x36f1bba134797da5ec5caf9ed4634903980ca305",
    usdtTrc20Address: process.env.USDT_TRC20_ADDRESS || "0x36f1bba134797da5ec5caf9ed4634903980ca305",
  },
  tokenConfig: {
    ticker: "KOTS",
    name: "King of the Screen",
    contractAddress: "HzkfcbeL2gTG5Xm1GomNbr9SwN96RUbGS6M42VhPpump",
    pumpFunUrl: "https://pump.fun/coin/HzkfcbeL2gTG5Xm1GomNbr9SwN96RUbGS6M42VhPpump",
    dexScreenerUrl: "https://dexscreener.com/solana/HzkfcbeL2gTG5Xm1GomNbr9SwN96RUbGS6M42VhPpump",
    totalSupply: 1000000000,
  },
};

fs.writeFileSync('data/state.json', JSON.stringify(genesisState, null, 2));
console.log("Local state reset to Genesis.");
