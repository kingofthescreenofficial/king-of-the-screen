const fs = require('fs');
let code = fs.readFileSync('web/components/WalletContextProvider.tsx', 'utf8');

const oldEndpoint = `  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => "https://rpc.ankr.com/solana", [network]);`;

const newEndpoint = `  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => "https://solana-rpc.publicnode.com", [network]);`;

if (code.includes(oldEndpoint)) {
    code = code.replace(oldEndpoint, newEndpoint);
    fs.writeFileSync('web/components/WalletContextProvider.tsx', code);
    console.log("Patched RPC endpoint to PublicNode!");
} else {
    console.log("Could not find Ankr endpoint block.");
}

let backendCode = fs.readFileSync('web/lib/blockchain.ts', 'utf8');
backendCode = backendCode.replace(
    'const RPC_URL = "https://rpc.ankr.com/solana";',
    'const RPC_URL = "https://solana-rpc.publicnode.com";'
);
fs.writeFileSync('web/lib/blockchain.ts', backendCode);
console.log("Patched backend RPC!");
