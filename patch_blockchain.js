const fs = require('fs');
const file = '/var/www/king-of-the-screen/web/lib/blockchain.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'if (!foundTransfer) {',
  'if (!foundTransfer) {\n      console.error("Solana validation failed for tx:", cleanSig, "err:", tx.meta?.err, "preBalances:", tx.meta?.preBalances, "postBalances:", tx.meta?.postBalances);\n      if (tx.meta?.err) return { valid: false, reason: "Transaction failed on the blockchain (check your Phantom wallet)." };'
);

fs.writeFileSync(file, code);
