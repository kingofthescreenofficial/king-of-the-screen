let currentPrice = 1;
let totalRaised = 1;
let kings = 1;
let totalTokensMined = 1 * 900;

function nextPrice(p) {
  if (p < 10) return p + 1;
  if (p < 100) return p + 5;
  if (p < 1000) return Math.round(p * 1.15);
  return Math.round(p * 1.10);
}

const nfts = [];

while (totalRaised < 1000000) {
  currentPrice = nextPrice(currentPrice);
  totalRaised += currentPrice;
  totalTokensMined += currentPrice * 900;
  kings++;
  
  if (kings <= 100) {
    nfts.push({king: kings, price: currentPrice, totalRaised});
  }
}

console.log("To reach $1,000,000 Total Raised:");
console.log("Total Kings (Dethronements):", kings);
console.log("Final Price of the Screen:", currentPrice);
console.log("Total $KOTS Mined:", totalTokensMined);
console.log("Total $KOTS Supply:", 1000000000);
console.log("Percentage of supply mined:", (totalTokensMined / 1000000000 * 100).toFixed(2) + "%");
console.log("Price at 25th King:", nfts[24] ? nfts[24].price : "N/A");
console.log("Price at 100th King:", nfts[99] ? nfts[99].price : "N/A");
console.log("Total raised at 100 Kings:", nfts[99] ? nfts[99].totalRaised : "N/A");
