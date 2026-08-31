const fs = require('fs');
const file = 'web/lib/state.ts';
let content = fs.readFileSync(file, 'utf8');

const oldBlock = `  // Validate bid amount with grace window for race conditions
  if (newKingData.paidAmountUsd < state.nextMinPriceUsd) {
    if (newKingData.paidAmountUsd < state.currentKing.paidAmountUsd) {
      return {
        success: false,
        state,
        error: \`Bid too low! Minimum required: $\${state.nextMinPriceUsd}. You sent: $\${newKingData.paidAmountUsd}\`,
      };
    }
    console.log("Race condition averted, accepting tied bid.");
  }`;

const newBlock = `  // Validate bid amount with a strict 60-second grace window for race conditions
  if (newKingData.paidAmountUsd < state.nextMinPriceUsd) {
    const isTied = newKingData.paidAmountUsd >= state.currentKing.paidAmountUsd;
    const isRecent = (now - state.currentKing.crownedAt) < 60000; // 60 seconds max
    
    if (!(isTied && isRecent)) {
      return {
        success: false,
        state,
        error: \`Bid too low! Minimum required: $\${state.nextMinPriceUsd}. You sent: $\${newKingData.paidAmountUsd}\`,
      };
    }
    console.log("Race condition averted, accepting tied bid within 60s window.");
  }`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(file, content);
console.log("Patched grace window");
