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
let totalTokensMined = 900; // Genesis

const TOTAL_SUPPLY = 1000000000; // 1 Billion

while (totalRaisedUsd < 1000000) {
    const bid = calculateNextPrice(currentPriceUsd);
    currentPriceUsd = bid;
    totalRaisedUsd += bid;
    totalDethronements++;
    
    // NEW RATE
    const minedTokens = Math.floor(bid * 900);
    totalTokensMined += minedTokens;
    
    if (totalTokensMined > TOTAL_SUPPLY) {
        console.error(`\n🚨 CRITICAL FAILURE 🚨 TOKENS EXHAUSTED AT $${totalRaisedUsd.toFixed(2)}`);
        break;
    }
}

console.log(`\n🎉 REACHED $1,000,000! 🎉`);
console.log(`Total Dethronements (NFTs needed): ${totalDethronements}`);
console.log(`Final Price: $${currentPriceUsd.toFixed(2)}`);
console.log(`Total Raised: $${totalRaisedUsd.toFixed(2)}`);
console.log(`Tokens Mined: ${totalTokensMined.toLocaleString()} / ${TOTAL_SUPPLY.toLocaleString()}`);
