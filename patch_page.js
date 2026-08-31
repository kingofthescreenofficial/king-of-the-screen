const fs = require('fs');
let code = fs.readFileSync('web/app/page.tsx', 'utf8');

const importInject = `import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Smartphone } from "lucide-react";\n`;
code = code.replace('import { Crown, Flame } from "lucide-react";', 'import { Crown, Flame, Smartphone } from "lucide-react";\n' + importInject);

const headerEndBlock = `            {/* Quick Action Button */}
            <button
              onClick={() => setIsTakeoverOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-colors"
            >
              <Flame className="w-4 h-4 fill-black" />
              <span>CLAIM THRONE</span>
            </button>
          </div>
        </header>`;

const newHeaderBlock = `            {/* Quick Action Button */}
            <button
              onClick={() => setIsTakeoverOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-colors"
            >
              <Flame className="w-4 h-4 fill-black" />
              <span>CLAIM THRONE</span>
            </button>
          </div>
        </header>

        {/* Global Wallet Connect (Web3 Standard) */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-2 -mt-4 mb-4">
           {typeof window !== 'undefined' && !(window as any).solana?.isPhantom && (
             <a 
               href="https://phantom.app/ul/browse/https%3A%2F%2Fkingofthescreen.fun"
               className="bg-[#ab9ff2] hover:bg-[#8b5cf6] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] sm:hidden w-full"
             >
               <Smartphone className="w-4 h-4" />
               <span>OPEN IN PHANTOM APP</span>
             </a>
           )}
           <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <WalletMultiButton style={{ backgroundColor: "#111119", border: "1px solid #333", height: "40px", borderRadius: "10px" }} />
           </div>
        </div>
`;

code = code.replace(headerEndBlock, newHeaderBlock);
fs.writeFileSync('web/app/page.tsx', code);
console.log("Patched page.tsx");
