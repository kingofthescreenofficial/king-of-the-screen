const fs = require('fs');
let code = fs.readFileSync('web/components/WalletContextProvider.tsx', 'utf8');

const oldEndpoint = `  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);`;

const newEndpoint = `  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => "https://rpc.ankr.com/solana", [network]);`;

if (code.includes(oldEndpoint)) {
    code = code.replace(oldEndpoint, newEndpoint);
    fs.writeFileSync('web/components/WalletContextProvider.tsx', code);
    console.log("Patched RPC endpoint to Ankr!");
} else {
    console.log("Could not find endpoint block.");
}
