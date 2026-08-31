let currentPrice = 1;
let totalRaised = 1;
let kings = 1;

function nextPrice(p) {
  if (p < 10) return p + 1;
  if (p < 100) return p + 5;
  if (p < 1000) return Math.round(p * 1.15);
  return Math.round(p * 1.10);
}

for (let i = 2; i <= 100; i++) {
  currentPrice = nextPrice(currentPrice);
  totalRaised += currentPrice;
}

console.log("At exactly 100 Kings:");
console.log("Price of 100th King:", currentPrice);
console.log("Total Raised:", totalRaised);
console.log("Tokens Mined (at 900/$):", totalRaised * 900);
