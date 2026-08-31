const fs = require('fs');

const file = 'web/components/TakeoverModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need to inject imports for wallet adapter
const importInjection = `import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
`;
content = content.replace('import confetti from "canvas-confetti";', importInjection + 'import confetti from "canvas-confetti";');

// Inject wallet hooks inside the component
const hooksInjection = `
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
`;
content = content.replace('const [errorMsg, setErrorMsg] = useState<string | null>(null);', 'const [errorMsg, setErrorMsg] = useState<string | null>(null);\n' + hooksInjection);

// Replace handleDirectWeb3Pay with handleSolana1ClickPay
const solanaPayCode = `
  const handleSolana1ClickPay = async () => {
    if (!publicKey) {
       setErrorMsg("Please connect your wallet first using the button above.");
       return;
    }
    
    setWalletConnecting(true);
    setErrorMsg(null);
    
    try {
        const solPriceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
        const priceData = await solPriceRes.json();
        const solPrice = priceData?.solana?.usd || 150;
        
        const lamports = Math.floor((bidAmount / solPrice) * LAMPORTS_PER_SOL);
        
        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(walletConfig.solanaAddress),
                lamports: lamports
            })
        );
        
        const signature = await sendTransaction(tx, connection);
        console.log("Transaction sent! Signature:", signature);
        
        // Pass signature to the backend
        await processTakeover(signature);
    } catch(err: any) {
        setErrorMsg("Wallet transaction failed or cancelled: " + err.message);
    } finally {
        setWalletConnecting(false);
    }
  };
`;
// We will replace handleDirectWeb3Pay with solanaPayCode
content = content.replace(/const handleDirectWeb3Pay = async \(\) => \{[\s\S]*?catch \(err: any\) \{[\s\S]*?\} finally \{[\s\S]*?\}[\s\S]*?\};/, solanaPayCode);

// Rewrite the payment UI
const newPaymentUI = `
                {/* SOLANA 1-CLICK & MANUAL PAYMENT SELECTOR */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs text-gray-300 font-bold flex items-center justify-between">
                    <span>CONNECT WALLET FOR 1-CLICK PAY</span>
                    <span className="text-[10px] text-purple-400">Powered by Phantom</span>
                  </label>

                  <div className="flex justify-center mb-4">
                     <WalletMultiButton style={{ backgroundColor: "#8b5cf6", width: "100%", justifyContent: "center", borderRadius: "12px", height: "48px" }} />
                  </div>

                  {publicKey && (
                    <div className="p-3 bg-gradient-to-r from-purple-950/60 to-purple-900/60 border border-purple-500/40 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-bold flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>Instant 1-Click Solana Pay</span>
                        </span>
                        <span className="text-[10px] text-purple-300">Connected</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleSolana1ClickPay}
                        disabled={walletConnecting || loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      >
                        {walletConnecting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>CONFIRMING IN PHANTOM...</span>
                          </>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4" />
                            <span>PAY \${bidAmount.toFixed(2)} VIA PHANTOM</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="pt-2 text-center text-xs text-gray-500">- OR MANUAL TRANSFER -</div>

                  {/* Solana Deposit Address Box */}
                  <div className="p-3.5 bg-black/40 border border-cyber-border rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 font-bold flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-purple-400" />
                        <span>Manual send to Treasury:</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-black/80 px-3 py-2.5 rounded-lg text-xs text-white font-mono border border-purple-500/30">
                      <span className="truncate">{walletConfig.solanaAddress}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(walletConfig.solanaAddress)}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 flex-shrink-0 font-bold"
                      >
                        {copiedAddress ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedAddress ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">
                        Solana Signature / txHash:
                      </label>
                      <input
                        type="text"
                        value={txHashInput}
                        onChange={(e) => setTxHashInput(e.target.value)}
                        placeholder="Paste your transaction signature here"
                        className="w-full bg-black/90 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
`;

// Replace the old UI block
content = content.replace(/\{\/\* REAL CRYPTO PAYMENT METHOD SELECTOR \*\/\}[\s\S]*?\{\/\* Error Message Placed Directly Above Submit Button \*\/\}/, newPaymentUI + '\n                {/* Error Message Placed Directly Above Submit Button */}');

// Also update processTakeover payload
content = content.replace('cryptoCurrency: paymentMethod === "SOLANA" ? "SOL" : "USDT",', 'cryptoCurrency: "SOL",');
content = content.replace('paidCryptoAmount: paymentMethod === "SOLANA" ? Number((bidAmount / 150).toFixed(4)) : bidAmount,', 'paidCryptoAmount: Number((bidAmount / 150).toFixed(4)),');

// Inject rewardWalletAddress defaulting
content = content.replace('rewardWalletAddress: rewardWalletAddress.trim() || undefined,', 'rewardWalletAddress: publicKey ? publicKey.toBase58() : rewardWalletAddress.trim() || undefined,');

fs.writeFileSync(file, content);
console.log("Patched TakeoverModal UI perfectly.");
