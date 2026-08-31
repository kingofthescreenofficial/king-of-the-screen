const fs = require('fs');
const file = '/Users/aleksejsavcenko/Documents/ANTIGRAVITY/GMAIL/VIRAL_SITE/web/lib/state.ts';
let content = fs.readFileSync(file, 'utf8');

const oldCheck = `  // Validate bid amount
  if (newKingData.paidAmountUsd < state.nextMinPriceUsd) {
    return {
      success: false,
      state,
      error: \`Bid too low! Minimum required: $\${state.nextMinPriceUsd}. You sent: $\${newKingData.paidAmountUsd}\`,
    };
  }`;

const newCheck = `  // Validate bid amount with a 1-step grace window for race conditions
  if (newKingData.paidAmountUsd < state.nextMinPriceUsd) {
    if (newKingData.paidAmountUsd < state.currentKing.paidAmountUsd) {
      return {
        success: false,
        state,
        error: \`Bid too low! Minimum required: $\${state.nextMinPriceUsd}. You sent: $\${newKingData.paidAmountUsd}\`,
      };
    }
    console.log('Race condition averted. Accepting tied bid of $' + newKingData.paidAmountUsd);
  }`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync(file, content);
