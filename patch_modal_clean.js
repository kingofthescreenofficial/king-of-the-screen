const fs = require('fs');
let code = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');

// 1. Remove SOLANA 1-CLICK & MANUAL PAYMENT SELECTOR block completely
const startBlock = code.indexOf('{/* SOLANA 1-CLICK & MANUAL PAYMENT SELECTOR */}');
const endBlock = code.indexOf('{/* Error Message Placed Directly Above Submit Button */}');
if (startBlock !== -1 && endBlock !== -1) {
    code = code.slice(0, startBlock) + code.slice(endBlock);
}

// 2. Rewrite the submit button
// Change from "disabled={loading || isUploading}" and "VERIFYING ON BLOCKCHAIN..." to reflect the new flow
const oldButton = `<button
                  type="submit"
                  disabled={loading || isUploading}
                  className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.7)] text-base uppercase tracking-wider transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>VERIFYING ON BLOCKCHAIN...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-5 h-5 fill-black" />
                      <span>CLAIM THRONE & MINE $KOTS (\${bidAmount.toFixed(2)})</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>`;

const newButton = `
                {/* WALLET STATUS & ACTION */}
                {!publicKey ? (
                   <div className="p-4 bg-purple-900/20 border-2 border-purple-500/50 rounded-xl text-center">
                     <p className="text-purple-300 font-bold mb-2">Wallet Not Connected</p>
                     <p className="text-xs text-gray-400">Please connect your Phantom wallet in the top right corner to claim the throne.</p>
                   </div>
                ) : (
                  <button
                    type="button"
                    onClick={async (e) => { e.preventDefault(); await handleSubmit(e); }}
                    disabled={loading || isUploading || walletConnecting}
                    className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 hover:from-purple-400 hover:to-purple-500 text-white font-black py-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.7)] text-base uppercase tracking-wider transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                  >
                    {loading || walletConnecting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>APPROVING IN PHANTOM...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-5 h-5 fill-white" />
                        <span>PAY \${bidAmount.toFixed(2)} & CLAIM THRONE</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
`;
code = code.replace(oldButton, newButton);

// 3. Update handleSubmit to call handleSolana1ClickPay directly
const oldSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nickname.trim()) {
      setErrorMsg("Please enter your King Nickname.");
      return;
    }
    if (!tagline.trim()) {
      setErrorMsg("Please enter your Tagline / Message.");
      return;
    }
    if (!mediaUrl.trim()) {
      setErrorMsg("Please upload or choose an image for the screen.");
      return;
    }
    if (bidAmount < nextMinPriceUsd) {
      setErrorMsg(\`Bid must be at least $\${nextMinPriceUsd.toFixed(2)}\`);
      return;
    }

    await processTakeover();
  };`;

const newSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!publicKey) {
      setErrorMsg("Wallet not connected!");
      return;
    }

    if (!nickname.trim()) {
      setErrorMsg("Please enter your King Nickname.");
      return;
    }
    if (!tagline.trim()) {
      setErrorMsg("Please enter your Tagline / Message.");
      return;
    }
    if (!mediaUrl.trim()) {
      setErrorMsg("Please upload or choose an image for the screen.");
      return;
    }
    if (bidAmount < nextMinPriceUsd) {
      setErrorMsg(\`Bid must be at least $\${nextMinPriceUsd.toFixed(2)}\`);
      return;
    }

    await handleSolana1ClickPay();
  };`;

code = code.replace(oldSubmit, newSubmit);

// 4. Remove reward wallet input since it's automatic
const rewardWalletRegex = /\{\/\* SOLANA REWARD AIRDROP WALLET INPUT \*\/\}[\s\S]*?\{\/\* Media Image \/ GIF Section \*\/\}/;
const rewardWalletReplacement = `
                {/* SOLANA REWARD AIRDROP WALLET INPUT */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-yellow-400" />
                      <span>AIRDROP WALLET (AUTO-DETECTED)</span>
                    </label>
                  </div>
                  <div className="w-full bg-black/70 border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono flex items-center gap-2">
                    {publicKey ? publicKey.toBase58() : "Not connected"}
                  </div>
                </div>

                {/* Media Image / GIF Section */}`;
code = code.replace(rewardWalletRegex, rewardWalletReplacement);

fs.writeFileSync('web/components/TakeoverModal.tsx', code);
console.log("Patched TakeoverModal clean");
