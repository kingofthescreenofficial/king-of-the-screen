const fs = require('fs');

let content = fs.readFileSync('web/lib/state.ts', 'utf8');

// Replace genesis token amount
content = content.replace(/minedTokens: 25000/g, 'minedTokens: 900');

// Replace calculateNextPrice function
const newFunc = `export function calculateNextPrice(currentPriceUsd: number): number {
  if (currentPriceUsd < 10) {
    return currentPriceUsd + 1;
  } else if (currentPriceUsd < 100) {
    return currentPriceUsd + 5;
  } else {
    return Math.round(currentPriceUsd * 1.10); // +10% exactly to hit $1,059,358 at 100 Kings
  }
}`;

content = content.replace(/export function calculateNextPrice[\s\S]*?^}/m, newFunc);

fs.writeFileSync('web/lib/state.ts', content);
console.log("Patched state.ts math!");
