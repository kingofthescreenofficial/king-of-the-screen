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

console.log("=== STARTING $1,000,000 SIMULATION ===");

while (totalRaisedUsd < 1000000) {
    const bid = calculateNextPrice(currentPriceUsd);
    currentPriceUsd = bid;
    totalRaisedUsd += bid;
    totalDethronements++;
    
    if (totalDethronements % 10 === 0 || totalRaisedUsd >= 1000000) {
        console.log(`[Dethronement #${totalDethronements}] Current Bid: $${bid.toFixed(2)} | Total Raised: $${totalRaisedUsd.toFixed(2)}`);
    }
}

console.log(`\n🎉 REACHED $1,000,000! 🎉`);
console.log(`Total Dethronements: ${totalDethronements}`);
console.log(`Final Price: $${currentPriceUsd.toFixed(2)}`);
