const fs = require('fs');
let code = fs.readFileSync('web/lib/blockchain.ts', 'utf8');

code = code.replace(
    'const RPC_URL = "https://api.mainnet-beta.solana.com";',
    'const RPC_URL = "https://rpc.ankr.com/solana";'
);

fs.writeFileSync('web/lib/blockchain.ts', code);
console.log("Patched blockchain.ts RPC!");
