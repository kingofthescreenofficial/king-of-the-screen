import fs from "fs";
import path from "path";
import { AppState, King } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "state.json");

const DEFAULT_STATE: AppState = {
  currentKing: {
    id: "genesis-king",
    nickname: "👑 Sovereign Origin",
    tagline: "The world's most contested screen has awakened. Dethrone me to rule!",
    link: "https://twitter.com",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    mediaType: "image",
    paidAmountUsd: 1,
    paidCryptoAmount: 0.005,
    cryptoCurrency: "SOL",
    crownedAt: Date.now() - 1000 * 60 * 12, // 12 minutes ago
    txHash: "genesis_block_0001",
    countryCode: "🌐",
  },
  nextMinPriceUsd: 2,
  stats: {
    totalRaisedUsd: 1,
    totalDethronements: 1,
    longestReignSeconds: 720,
    longestReignKing: "👑 Sovereign Origin",
    targetGoalUsd: 1000000,
  },
  hallOfFame: [],
  recentEvents: [
    {
      id: "ev-1",
      type: "TAKEOVER",
      text: "👑 Sovereign Origin claimed the throne for $1.00",
      timestamp: Date.now() - 1000 * 60 * 12,
    },
  ],
  walletConfig: {
    solanaAddress: process.env.SOLANA_WALLET_ADDRESS || "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    evmAddress: process.env.EVM_WALLET_ADDRESS || "0x36f1bba134797da5ec5caf9ed4634903980ca305",
    usdtTrc20Address: process.env.USDT_TRC20_ADDRESS || "0x36f1bba134797da5ec5caf9ed4634903980ca305",
  },
};

export function getAppState(): AppState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading state file:", error);
  }
  saveAppState(DEFAULT_STATE);
  return DEFAULT_STATE;
}

export function saveAppState(state: AppState): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving state file:", error);
  }
}

export function calculateNextPrice(currentPriceUsd: number): number {
  if (currentPriceUsd < 10) {
    return currentPriceUsd + 1;
  } else if (currentPriceUsd < 100) {
    return currentPriceUsd + 5;
  } else if (currentPriceUsd < 1000) {
    return Math.round(currentPriceUsd * 1.15); // +15%
  } else {
    return Math.round(currentPriceUsd * 1.10); // +10%
  }
}

export function executeDethronement(newKingData: Omit<King, "id" | "crownedAt" | "dethronedAt" | "reignDurationSeconds">): { success: boolean; state: AppState; error?: string } {
  const state = getAppState();
  const now = Date.now();

  // Validate bid amount
  if (newKingData.paidAmountUsd < state.nextMinPriceUsd) {
    return {
      success: false,
      state,
      error: `Bid too low! Minimum required: $${state.nextMinPriceUsd}. You sent: $${newKingData.paidAmountUsd}`,
    };
  }

  // 1. Archive current king
  const oldKing = { ...state.currentKing };
  const reignDurationSeconds = Math.max(1, Math.floor((now - oldKing.crownedAt) / 1000));
  oldKing.dethronedAt = now;
  oldKing.reignDurationSeconds = reignDurationSeconds;

  // Add old king to Hall of Fame (keep last 50)
  state.hallOfFame.unshift(oldKing);
  if (state.hallOfFame.length > 50) {
    state.hallOfFame.pop();
  }

  // 2. Crown new king
  const newKing: King = {
    ...newKingData,
    id: `king_${now}_${Math.random().toString(36).substring(2, 7)}`,
    crownedAt: now,
  };
  state.currentKing = newKing;

  // 3. Update stats
  state.stats.totalRaisedUsd += newKingData.paidAmountUsd;
  state.stats.totalDethronements += 1;
  if (reignDurationSeconds > state.stats.longestReignSeconds) {
    state.stats.longestReignSeconds = reignDurationSeconds;
    state.stats.longestReignKing = oldKing.nickname;
  }

  // 4. Calculate next minimum price
  state.nextMinPriceUsd = calculateNextPrice(newKingData.paidAmountUsd);

  // 5. Add event
  state.recentEvents.unshift({
    id: `ev-${now}`,
    type: "TAKEOVER",
    text: `⚡ ${newKing.nickname} DETHRONED the King with $${newKing.paidAmountUsd.toFixed(2)} (${newKing.cryptoCurrency})!`,
    timestamp: now,
  });
  if (state.recentEvents.length > 20) {
    state.recentEvents.pop();
  }

  saveAppState(state);
  return { success: true, state };
}

export function resetToGenesis(fullReset: boolean = false): AppState {
  const state = getAppState();
  const now = Date.now();

  state.currentKing = {
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
    id: `king_genesis_${now}`,
    crownedAt: now,
  };

  state.nextMinPriceUsd = 2;

  if (fullReset) {
    state.stats = {
      totalRaisedUsd: 1,
      totalDethronements: 1,
      longestReignSeconds: 1420,
      longestReignKing: "👑 Sovereign Origin",
      targetGoalUsd: 1000000,
    };
    state.hallOfFame = [];
    state.recentEvents = [
      {
        id: `ev-${now}`,
        type: "TAKEOVER",
        text: "👑 Sovereign Origin claimed the throne for $1.00 (SOL)!",
        timestamp: now,
      },
    ];
  }

  saveAppState(state);
  return state;
}
