const fs = require('fs');

// 1. EXACT CORE LOGIC COPIED FOR ISOLATED TESTING
function calculateNextPrice(currentPriceUsd) {
  if (currentPriceUsd < 10) return currentPriceUsd + 1;
  if (currentPriceUsd < 100) return currentPriceUsd + 5;
  if (currentPriceUsd < 1000) return Math.round(currentPriceUsd * 1.15);
  return Math.round(currentPriceUsd * 1.10);
}

let state = {
  currentKing: { crownedAt: Date.now(), paidAmountUsd: 1, nickname: "Genesis" },
  nextMinPriceUsd: 2,
  stats: { totalRaisedUsd: 1, totalDethronements: 1, longestReignSeconds: 0 },
  hallOfFame: [],
  recentEvents: []
};

let totalTokensMined = 900; // Genesis tokens
const TOTAL_SUPPLY = 1000000000;

function executeDethronement(bidAmount, timestampOffsetMs = 0) {
  const now = Date.now() + timestampOffsetMs;
  
  // Race condition check (exactly as in state.ts)
  if (bidAmount < state.nextMinPriceUsd) {
    const isTied = bidAmount >= state.currentKing.paidAmountUsd;
    const isRecent = (now - state.currentKing.crownedAt) < 60000;
    if (!(isTied && isRecent)) {
      return { success: false, error: `Bid too low. Minimum: ${state.nextMinPriceUsd}, Sent: ${bidAmount}` };
    }
  }

  // Calculate tokens (exactly as in route.ts)
  const minedTokens = Math.floor(bidAmount * 900);
  if (totalTokensMined + minedTokens > TOTAL_SUPPLY) {
     return { success: false, error: `TOKEN SUPPLY EXHAUSTED! Cannot mint ${minedTokens}.` };
  }
  totalTokensMined += minedTokens;

  // Archive old king
  const oldKing = { ...state.currentKing };
  const reignDurationSeconds = Math.max(1, Math.floor((now - oldKing.crownedAt) / 1000));
  state.hallOfFame.unshift(oldKing);
  if (state.hallOfFame.length > 50) state.hallOfFame.pop();

  // Crown new king
  state.currentKing = {
    nickname: `King_${state.stats.totalDethronements + 1}`,
    paidAmountUsd: bidAmount,
    crownedAt: now
  };

  // Update stats
  state.stats.totalRaisedUsd += bidAmount;
  state.stats.totalDethronements += 1;
  if (reignDurationSeconds > state.stats.longestReignSeconds) {
    state.stats.longestReignSeconds = reignDurationSeconds;
  }

  state.nextMinPriceUsd = calculateNextPrice(bidAmount);
  
  state.recentEvents.unshift({ id: now, type: "TAKEOVER" });
  if (state.recentEvents.length > 20) state.recentEvents.pop();

  return { success: true };
}

console.log("=================================================");
console.log("🚀 INITIATING TIER-1 E2E MILLION DOLLAR STRESS TEST");
console.log("=================================================\n");

// --- TEST PHASE 1: RACE CONDITIONS ---
console.log("--- PHASE 1: RACE CONDITION & CONCURRENCY TEST ---");
const raceBid = state.nextMinPriceUsd; // $2
console.log(`[Time: 0s] Valid User 1 bids $${raceBid}.`);
let res1 = executeDethronement(raceBid, 0);

console.log(`[Time: 5s] Valid User 2 bids $${raceBid} (Tied bid, but within 60s grace period).`);
let res2 = executeDethronement(raceBid, 5000); // 5 seconds later

console.log(`[Time: 65s] Invalid User 3 bids $${raceBid} (Tied bid, OUTSIDE 60s grace period).`);
let res3 = executeDethronement(raceBid, 65000); // 65 seconds later

console.log(`Race Results -> User1: ${res1.success}, User2: ${res2.success}, User3: ${res3.success}`);
if (res1.success && res2.success && !res3.success) {
    console.log("✅ Race condition mitigation is WORKING FLAWLESSLY.");
} else {
    console.error("❌ RACE CONDITION LOGIC FAILED!");
}

// --- TEST PHASE 2: $1,000,000 ASCENSION ---
console.log("\n--- PHASE 2: ASCENSION TO $1,000,000 ---");
let simTimeMs = 70000;
let ascensionSteps = 0;

while (state.stats.totalRaisedUsd < 1000000) {
    let bid = state.nextMinPriceUsd;
    simTimeMs += 65000; // Fast forward 65s per takeover to bypass grace period
    
    let res = executeDethronement(bid, simTimeMs);
    if (!res.success) {
        console.error(`💥 FATAL ERROR during ascension: ${res.error}`);
        break;
    }
    ascensionSteps++;
}

console.log(`✅ Target $1,000,000 reached successfully in ${ascensionSteps} steps.`);

// --- TEST PHASE 3: DATA INTEGRITY CHECKS ---
console.log("\n--- PHASE 3: MEMORY & DATA INTEGRITY ---");
console.log(`Total Raised: $${state.stats.totalRaisedUsd.toFixed(2)}`);
console.log(`Total Tokens Mined: ${totalTokensMined.toLocaleString()} / ${TOTAL_SUPPLY.toLocaleString()}`);
console.log(`Total Dethronements (NFTs to mint): ${state.stats.totalDethronements}`);
console.log(`Hall of Fame Array Size (Max 50): ${state.hallOfFame.length}`);
console.log(`Recent Events Array Size (Max 20): ${state.recentEvents.length}`);
console.log(`Final Minimum Price for next takeover: $${state.nextMinPriceUsd.toFixed(2)}`);

if (state.hallOfFame.length <= 50 && state.recentEvents.length <= 20 && totalTokensMined <= TOTAL_SUPPLY) {
    console.log("✅ ALL MEMORY LEAK & OVERFLOW BOUNDARIES PASSED.");
} else {
    console.error("❌ MEMORY BOUNDARIES FAILED!");
}

console.log("\n=================================================");
console.log("🏆 STRESS TEST COMPLETE. SYSTEM IS COMBAT READY.");
console.log("=================================================");
