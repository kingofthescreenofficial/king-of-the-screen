function calculateNextPrice(currentPriceUsd) {
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

let currentPriceUsd = 1;
let totalRaisedUsd = 1;
let totalDethronements = 1;
let totalTokensMined = 25000; // Genesis

const TOTAL_SUPPLY = 1000000000; // 1 Billion

console.log("=== STARTING $1,000,000 SIMULATION ===");

while (totalRaisedUsd < 1000000) {
    const bid = calculateNextPrice(currentPriceUsd);
    currentPriceUsd = bid;
    totalRaisedUsd += bid;
    totalDethronements++;
    
    // In API: const minedTokens = Math.floor(cleanAmount * 25000);
    const minedTokens = Math.floor(bid * 25000);
    totalTokensMined += minedTokens;
    
    if (totalDethronements % 10 === 0 || totalTokensMined >= TOTAL_SUPPLY || totalRaisedUsd >= 1000000) {
        console.log(`[Dethronement #${totalDethronements}] Current Bid: $${bid.toFixed(2)} | Total Raised: $${totalRaisedUsd.toFixed(2)} | Tokens Mined: ${totalTokensMined.toLocaleString()} / ${TOTAL_SUPPLY.toLocaleString()}`);
        
        if (totalTokensMined >= TOTAL_SUPPLY) {
            console.error(`\n🚨 CRITICAL FAILURE 🚨`);
            console.error(`TOKEN SUPPLY EXHAUSTED AT $${totalRaisedUsd.toFixed(2)} RAISED!`);
            console.error(`Cannot proceed. The fixed rate of 25,000 KOTS/$1 drains the 1B supply way before $1,000,000.`);
            break;
        }
    }
}
