const fs = require('fs');
let code = fs.readFileSync('airdrop_sentinel.js', 'utf8');

// Replace the long name with a shorter one
code = code.replace(/name: \`King of the Screen #\$\{entry.kingId\}\`/g, 'name: `KOTS King #${entry.kingId.slice(-6).toUpperCase()}`');

fs.writeFileSync('airdrop_sentinel.js', code);
console.log("Patched sentinel NFT name length bug");
