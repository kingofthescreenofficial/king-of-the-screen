const fs = require('fs');
let code = fs.readFileSync('web/app/page.tsx', 'utf8');

// 1. Import useWallet
if (!code.includes('useWallet')) {
    code = code.replace('import { WalletMultiButton }', 'import { useWallet } from "@solana/wallet-adapter-react";\nimport { WalletMultiButton }');
}

// 2. Add hook call
if (!code.includes('const { publicKey } = useWallet();')) {
    code = code.replace('const [state, setState] = useState<AppState | null>(null);', 'const { publicKey } = useWallet();\n  const [state, setState] = useState<AppState | null>(null);');
}

// 3. Change WalletMultiButton
const oldBtn = '<WalletMultiButton style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "48px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", justifyContent: "center" }} />';
const newBtn = `<WalletMultiButton style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "48px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", justifyContent: "center" }}>
                 {!publicKey ? "CONNECT WALLET" : undefined}
              </WalletMultiButton>`;

code = code.replace(oldBtn, newBtn);

fs.writeFileSync('web/app/page.tsx', code);
console.log("Patched button text to CONNECT WALLET");
