const fs = require('fs');
const file = '/Users/aleksejsavcenko/Documents/ANTIGRAVITY/GMAIL/VIRAL_SITE/web/lib/state.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "console.log('Race condition averted. Accepting tied bid of \n",
  "console.log('Race condition averted. Accepting tied bid of $' + newKingData.paidAmountUsd);\n  }\n"
);
fs.writeFileSync(file, content);
