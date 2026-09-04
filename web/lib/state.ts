import path from "path";
import { importLegacyAuctionState, importLegacyTelemetry, readAuctionState, writeAuctionState } from "./database";
import { AUCTION_MANIFEST_V1, getCrownPriceCents } from "./auction-manifest";
import { calculateNextPrice } from "./pricing";
import { AppState, King } from "./types";

export { calculateNextPrice } from "./pricing";

const SEED_FILE = path.join(process.cwd(), "data", "state.json");
const LEGACY_PRODUCTION_FILE = path.join("/tmp", "state.json");
const LEGACY_TELEMETRY_FILE = path.join(process.cwd(), "analytics", "telemetry.jsonl");

export const DEFAULT_STATE: AppState = {
  currentKing: {
    nickname: "Hoku",
    tagline: "forever KING",
    link: "https://king-of-the-screen.vercel.app",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    mediaType: "image",
    paidAmountUsd: 0,
    paidCryptoAmount: 0,
    cryptoCurrency: "DEMO",
    countryCode: "👑",
    id: "king_hoku_001",
    crownedAt: 1787753367000,
    rewardWalletAddress: "CC3SUMpNzWDMpAt2JxtYERohLmyHjj2GPxWscYXnW1Fo",
  },
  nextMinPriceUsd: 2,
  stats: {
    totalRaisedUsd: 0,
    totalDethronements: 0,
    settledCrownCount: 0,
    longestReignSeconds: 1800,
    longestReignKing: "Hoku",
    targetGoalUsd: 1000000,
  },
  hallOfFame: [],
  recentEvents: [
    {
    id: "ev-hoku-preview",
      type: "TAKEOVER",
    text: "👑 Preview throne. Payments are disabled.",
      timestamp: 1787753367000,
    },
  ],
  walletConfig: {
    solanaAddress: process.env.SOLANA_WALLET_ADDRESS || "EkgfzyrqfTZB8Er3XPSYn6nVmtTv4hvCo3F9Drkd62Aq",
    evmAddress: "",
    usdtTrc20Address: "",
  },
};

// In-memory runtime state for fast serverless responses
let memoryState: AppState | null = null;

export function getAppState(): AppState {
  if (memoryState) {
    return memoryState;
  }

  try {
    importLegacyTelemetry(LEGACY_TELEMETRY_FILE);
    const durableState = readAuctionState();
    if (durableState) {
      memoryState = durableState;
      return memoryState!;
    }

    const importedProductionState = importLegacyAuctionState(LEGACY_PRODUCTION_FILE);
    if (importedProductionState) {
      memoryState = importedProductionState;
      return memoryState;
    }

    const importedSeedState = importLegacyAuctionState(SEED_FILE);
    if (importedSeedState) {
      memoryState = importedSeedState;
      return memoryState;
    }
  } catch (error) {
    console.error("Error reading auction state:", error);
  }

  const initialState = JSON.parse(JSON.stringify(DEFAULT_STATE)) as AppState;
  saveAppState(initialState);
  return initialState;
}

export function saveAppState(state: AppState): void {
  memoryState = state;
  writeAuctionState(state);
}

export function executeDethronement(newKingData: Omit<King, "id" | "crownedAt" | "dethronedAt" | "reignDurationSeconds">): { success: boolean; state: AppState; error?: string } {
  const state = getAppState();
  const now = Date.now();
  const settledCrownCount = state.stats.settledCrownCount ?? 0;
  const nextOrdinal = settledCrownCount + 1;

  if (nextOrdinal > AUCTION_MANIFEST_V1.crownLimit) {
    return { success: false, state, error: "CROWN_SERIES_COMPLETE" };
  }

  const expectedPriceUsd = getCrownPriceCents(nextOrdinal) / 100;

  if (Math.round(newKingData.paidAmountUsd * 100) !== getCrownPriceCents(nextOrdinal)) {
    return {
      success: false,
      state,
      error: `CROWN_PRICE_MISMATCH:${expectedPriceUsd.toFixed(2)}`,
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
  state.stats.totalRaisedUsd += expectedPriceUsd;
  state.stats.totalDethronements += 1;
  state.stats.settledCrownCount = nextOrdinal;
  if (reignDurationSeconds > state.stats.longestReignSeconds) {
    state.stats.longestReignSeconds = reignDurationSeconds;
    state.stats.longestReignKing = oldKing.nickname;
  }

  // 4. Calculate next minimum price
  state.nextMinPriceUsd = nextOrdinal === AUCTION_MANIFEST_V1.crownLimit
    ? 0
    : getCrownPriceCents(nextOrdinal + 1) / 100;

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
  const now = Date.now();

  const freshState: AppState = {
    currentKing: {
      nickname: "👑 Sovereign Origin",
      tagline: "The world's most contested digital screen is LIVE. Dethrone me to rule!",
      link: "https://x.com",
      mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      mediaType: "image",
      paidAmountUsd: 0,
      paidCryptoAmount: 0.005,
      cryptoCurrency: "DEMO",
      countryCode: "🌐",
      id: `king_genesis_${now}`,
      crownedAt: now,
    },
    nextMinPriceUsd: getCrownPriceCents(1) / 100,
    stats: {
      totalRaisedUsd: 0,
      totalDethronements: 0,
      settledCrownCount: 0,
      longestReignSeconds: 1420,
      longestReignKing: "👑 Sovereign Origin",
      targetGoalUsd: 1000000,
    },
    hallOfFame: [],
    recentEvents: [
      {
        id: `ev-${now}`,
        type: "TAKEOVER",
        text: "👑 Preview throne. Payments are disabled.",
        timestamp: now,
      },
    ],
    walletConfig: {
      solanaAddress: process.env.SOLANA_WALLET_ADDRESS || "EkgfzyrqfTZB8Er3XPSYn6nVmtTv4hvCo3F9Drkd62Aq",
      evmAddress: "",
      usdtTrc20Address: "",
    },
  };

  saveAppState(freshState);
  return freshState;
}
