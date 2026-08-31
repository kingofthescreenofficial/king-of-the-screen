const fs = require('fs');
let code = fs.readFileSync('web/app/page.tsx', 'utf8');

// 1. Add isMobileExternal state and useEffect
if (!code.includes('isMobileExternal')) {
    const hookInject = `  const { publicKey } = useWallet();
  const [state, setState] = useState<AppState | null>(null);
  const [isMobileExternal, setIsMobileExternal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasSolana = typeof window !== 'undefined' && ('solana' in window || 'phantom' in window);
    if (isMobile && !hasSolana) {
      setIsMobileExternal(true);
    }
  }, []);`;
  
    code = code.replace(/const \{ publicKey \} = useWallet\(\);\n  const \[state, setState\] = useState<AppState \| null>\(null\);/, hookInject);
}

// 2. Replace the WalletMultiButton with the conditional magic button
const oldButtonBlock = `<WalletMultiButton style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "48px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", justifyContent: "center" }}>
                 {!publicKey ? "CONNECT WALLET" : undefined}
              </WalletMultiButton>`;

const newButtonBlock = `{mounted && isMobileExternal ? (
                <a 
                  href="https://phantom.app/ul/browse/https://kingofthescreen.fun?ref=https://kingofthescreen.fun"
                  className="flex items-center justify-center transition-all hover:bg-purple-500 active:scale-95"
                  style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "48px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", color: "white", textDecoration: "none" }}
                >
                  CONNECT WALLET
                </a>
              ) : (
                <WalletMultiButton style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "48px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", justifyContent: "center" }}>
                  {!publicKey ? "CONNECT WALLET" : undefined}
                </WalletMultiButton>
              )}`;

code = code.replace(oldButtonBlock, newButtonBlock);

fs.writeFileSync('web/app/page.tsx', code);
console.log("Patched page.tsx to include seamless mobile deep linking!");
