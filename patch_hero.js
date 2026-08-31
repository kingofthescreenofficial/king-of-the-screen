const fs = require('fs');
let code = fs.readFileSync('web/components/ConceptHero.tsx', 'utf8');

const oldStepsRegex = /\{\/\* 3 Step Visual Flow \*\/\}\s*<div className="grid grid-cols-1 sm:grid-cols-3 gap-3\.5 my-6">[\s\S]*?\{\/\* Action Strip \*\/\}/;
const newSteps = `{/* 3 Step Actionable Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
        {/* Step 1 */}
        <div className="bg-black/60 border border-cyber-border/80 hover:border-purple-500/60 p-4 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-black border border-purple-500/40">
              1
            </span>
            <Zap className="w-4 h-4" />
            <span>Connect Wallet</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Connect your Phantom wallet in the top right corner. Mobile users? Just click "Open in Phantom".
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-black/60 border border-cyber-border/80 hover:border-yellow-500/60 p-4 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-black border border-yellow-500/40">
              2
            </span>
            <Crown className="w-4 h-4" />
            <span>Claim the Throne</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Click "Claim Throne", upload your image, and write your message. It will be broadcasted globally.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-black/60 border border-cyber-border/80 hover:border-emerald-500/60 p-4 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-black border border-emerald-500/40">
              3
            </span>
            <Sparkles className="w-4 h-4" />
            <span>Sign & Mine</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Approve the 1-click transaction. You instantly become King, mine $KOTS tokens, and get a Genesis NFT!
          </p>
        </div>
      </div>

      {/* Action Strip */}`;

code = code.replace(oldStepsRegex, newSteps);
code = code.replace('Non-custodial Base & Solana micro-payments', 'Instant 1-Click Solana micro-payments');

fs.writeFileSync('web/components/ConceptHero.tsx', code);
console.log("Patched ConceptHero");
