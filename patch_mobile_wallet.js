const fs = require('fs');
let code = fs.readFileSync('web/app/page.tsx', 'utf8');

// We need to inject a robust client-side check
// Let's add an effect to page.tsx
const effectInjection = `
  const [isPhantomBrowser, setIsPhantomBrowser] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && (window as any).solana?.isPhantom) {
      setIsPhantomBrowser(true);
    }
  }, []);
`;
code = code.replace('const lastStateHashRef = useRef<string>("");', 'const lastStateHashRef = useRef<string>("");\n' + effectInjection);

const oldWalletBlock = /{typeof window !== 'undefined' && !\(window as any\).solana\?.isPhantom && \([\s\S]*?w-full sm:w-auto flex justify-center sm:justify-end">\n\s*<WalletMultiButton style={{ backgroundColor: "#111119", border: "1px solid #333", height: "40px", borderRadius: "10px" }} \/>\n\s*<\/div>\n\s*<\/div>/;

const newWalletBlock = `{mounted && !isPhantomBrowser && (
             <a 
               href="https://phantom.app/ul/browse/https%3A%2F%2Fkingofthescreen.fun"
               className="bg-[#ab9ff2] hover:bg-[#8b5cf6] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] sm:hidden w-full mb-2"
             >
               <Smartphone className="w-5 h-5" />
               <span className="text-sm">OPEN APP IN PHANTOM</span>
             </a>
           )}
           <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <WalletMultiButton style={{ backgroundColor: "#111119", border: "1px solid #333", height: "40px", borderRadius: "10px" }} />
           </div>
        </div>`;

code = code.replace(oldWalletBlock, newWalletBlock);
fs.writeFileSync('web/app/page.tsx', code);
console.log("Patched hydration issue in page.tsx");
