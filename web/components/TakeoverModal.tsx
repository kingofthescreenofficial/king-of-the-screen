"use client";

import React, { useState, useRef, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL, ComputeBudgetProgram } from "@solana/web3.js";
import confetti from "canvas-confetti";
import {
  X,
  Flame,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Copy,
  Check,
  ArrowRight,
  Smartphone,
  AlertCircle,
  RefreshCw,
  Trash2,
  Wallet,
  Zap,
  ExternalLink,
  Coins,
  Gem,
  Sparkles,
  Send,
  TrendingUp,
} from "lucide-react";
import { AppState } from "@/lib/types";
import { RoyalNFTCard } from "./RoyalNFTCard";

interface TakeoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextMinPriceUsd: number;
  walletConfig: AppState["walletConfig"];
  onSuccess: (updatedState: AppState) => void;
}



export const TakeoverModal: React.FC<TakeoverModalProps> = ({
  isOpen,
  onClose,
  nextMinPriceUsd,
  walletConfig,
  onSuccess,
}) => {
  const [nickname, setNickname] = useState("");
  const [tagline, setTagline] = useState("");
  const [link, setLink] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [bidAmount, setBidAmount] = useState<number>(nextMinPriceUsd);
      const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [mintedNFTKing, setMintedNFTKing] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial bid amount without resetting while user types
  useEffect(() => {
    if (isOpen) {
      setBidAmount((prev) => Math.max(prev, nextMinPriceUsd));
    }
  }, [isOpen, nextMinPriceUsd]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FACC15", "#00FF66", "#EC4899", "#A855F7"],
      });
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Client-side instant image compression
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === "image/gif") {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1200;
          let { width, height } = img;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          resolve(compressed);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setErrorMsg(null);
    setIsUploading(true);

    try {
      const compressedDataUrl = await compressImage(file);
      setMediaUrl(compressedDataUrl);
    } catch (err: any) {
      setErrorMsg("Failed to process image. Please try another photo or use a link.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // 1-Click In-Browser Web3 Payment
  
  const handleSolana1ClickPay = async () => {
    if (!publicKey) {
       setErrorMsg("Please connect your wallet first using the button above.");
       return;
    }
    
    setWalletConnecting(true);
    setErrorMsg(null);
    
    try {
        let solPrice = 150;
        try {
            const solPriceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
            if (solPriceRes.ok) {
                const priceData = await solPriceRes.json();
                if (priceData?.solana?.usd) solPrice = priceData.solana.usd;
            }
        } catch (apiErr) {
            console.warn("CoinGecko API blocked or failed, using fallback SOL price.");
        }
        
        const lamports = Math.floor((bidAmount / solPrice) * LAMPORTS_PER_SOL);
        
        // Add priority fee to prevent Solana network from dropping the transaction during congestion
        const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 150000, // 0.00015 SOL per compute unit - high priority
        });

        const treasuryLamports = Math.floor(lamports * 0.80);
        const hotWalletLamports = lamports - treasuryLamports;
        const HOT_WALLET = "AahUkkoX21nkqkD3xnQUvsCcxQYbS9ajB2uurStj31xr";

        const tx = new Transaction().add(
            priorityFeeIx,
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(walletConfig.solanaAddress),
                lamports: treasuryLamports
            }),
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(HOT_WALLET),
                lamports: hotWalletLamports
            })
        );
        
        setLoading(true);
        setErrorMsg("Requesting wallet signature...");
        
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = publicKey;
        
        const signature = await sendTransaction(tx, connection, { maxRetries: 5 });
        console.log("Transaction sent! Signature:", signature);
        
        setErrorMsg("Confirming transaction on blockchain... (usually takes 3-10 seconds)");
        
        // Wait for confirmation to avoid backend race conditions (where meta is null)
        await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        }, "confirmed");

        // Pass signature to the backend
        await processTakeover(signature);
    } catch(err: any) {
        setErrorMsg("Wallet transaction failed or cancelled: " + err.message);
    } finally {
        setWalletConnecting(false);
    }
  };


  const processTakeover = async (hash?: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const finalTxHash = hash?.trim();

      if (!finalTxHash) {
        throw new Error("Transaction failed or no hash provided.");
      }

      const res = await fetch("/api/takeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          tagline,
          link: link.trim() || undefined,
          rewardWalletAddress: publicKey ? publicKey.toBase58() : undefined,
          mediaUrl,
          mediaType: "image",
          paidAmountUsd: bidAmount,
          cryptoCurrency: "SOL",
          paidCryptoAmount: Number((bidAmount / 150).toFixed(4)),
          txHash: finalTxHash,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => "");
        if (text.includes("Too Large")) {
          throw new Error("Uploaded image is too large. Please select a smaller photo.");
        }
        throw new Error("Server communication error. Please try again.");
      }

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Takeover failed. Please verify your transaction.");
      } else {
        triggerConfetti();
        onSuccess(data.state);
        setMintedNFTKing(data.state.currentKing);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      setErrorMsg(`Bid must be at least ${nextMinPriceUsd.toFixed(2)}`);
      return;
    }

    await handleSolana1ClickPay();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-3 sm:p-4">
      <div className="min-h-full flex items-start sm:items-center justify-center py-6 sm:py-10">
        <div className="relative w-full max-w-2xl bg-[#111119] border-2 border-yellow-500/70 rounded-2xl shadow-2xl p-5 sm:p-8 text-white font-mono">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 text-gray-400 hover:text-white bg-black/70 hover:bg-black rounded-full transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* If King was just crowned, show their exclusive NFT Card */}
          {mintedNFTKing ? (
            <div className="space-y-5 text-center py-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full uppercase">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>THRONE CONQUERED & REWARDS DISPATCHED!</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-yellow-400">
                ALL HAIL {mintedNFTKing.nickname}!
              </h2>
              
              {/* Automated Airdrop Delivery Badge */}
              <div className="p-3 bg-black/80 border border-emerald-500/60 rounded-xl text-xs flex items-center justify-between text-left max-w-sm mx-auto">
                <div className="space-y-0.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AUTOMATIC AIRDROP DISPATCHED:</span>
                  </span>
                  <span className="text-gray-300 text-[11px] block">
                    +{(mintedNFTKing.paidAmountUsd * 900).toLocaleString()} $KOTS + Genesis NFT #3
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-[10px]">
                  QUEUED
                </span>
              </div>

              <RoyalNFTCard king={mintedNFTKing} ordinalNumber={3} totalCap={100} />

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-cyber-card border border-cyber-border hover:border-yellow-500 py-3 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-colors"
              >
                Return to Live Screen
              </button>
            </div>
          ) : (
            <>
              {/* Modal Header */}
              <div className="text-center mb-5 pr-8 sm:pr-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span>GLOBAL THRONE CHALLENGE</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-yellow-400">
                  DETHRONE THE CURRENT KING
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Minimum bid to rule: <strong className="text-emerald-400 font-bold">${nextMinPriceUsd.toFixed(2)}</strong>. You hold the screen until outbid!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                {/* Nickname & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs text-gray-300 font-bold mb-1">
                      YOUR NAME / ALIAS <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g. @PEPE_Lord or Alex"
                      maxLength={30}
                      required
                      className="w-full bg-black/70 border border-cyber-border rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 font-bold mb-1">
                      TARGET LINK (Optional)
                    </label>
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="example.com, t.me/..., x.com/..."
                      className="w-full bg-black/70 border border-cyber-border rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Tagline / Message */}
                <div>
                  <label className="block text-xs text-gray-300 font-bold mb-1">
                    YOUR MESSAGE TO THE WORLD <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="What should millions of people see right now?"
                    maxLength={140}
                    required
                    className="w-full bg-black/70 border border-cyber-border rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                
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

                {/* Media Image / GIF Section */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-xs text-gray-300 font-bold">
                      SCREEN IMAGE / GIF <span className="text-red-400">*</span>
                    </label>
                  </div>

                  {showUrlInput ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://example.com/image.png"
                        className="w-full bg-[#0a0a0f] border-2 border-gray-800 focus:border-yellow-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-700 outline-none transition-colors"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowUrlInput(false)}
                        className="text-xs text-yellow-500 hover:text-yellow-400 font-bold uppercase tracking-wider"
                      >
                        ← Back to Gallery Upload
                      </button>
                    </div>
                  ) : (
                  <>
                  {/* Local File Upload with Auto-Optimization */}
                  <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-cyber-border hover:border-yellow-500/80 bg-black/50 hover:bg-black/70 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="flex items-center gap-2 text-yellow-400 text-xs py-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Optimizing photo for instant broadcast...</span>
                        </div>
                      ) : mediaUrl ? (
                         <div className="w-full flex items-center justify-between px-2 py-1">
                           <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0">
                               <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                             </div>
                             <div className="text-left">
                               <span className="text-sm font-bold text-yellow-400 block">Image attached!</span>
                               <span className="text-[10px] text-gray-400 block">Tap to change</span>
                             </div>
                           </div>
                         </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-yellow-400/80" />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Tap to select photo / GIF from device
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Auto-optimized for instant full HD display
                            </span>
                          </div>
                        </>
                      )}
                  </div>
                  <div className="text-right mt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowUrlInput(true)}
                      className="text-[10px] text-gray-500 hover:text-gray-400 font-bold uppercase tracking-wider"
                    >
                      Having trouble? Paste image URL
                    </button>
                  </div>
                  </>
                  )}
                </div>

                {/* Error Message Placed Directly Above Submit Button */}
                {errorMsg && (
                  <div className="p-3.5 bg-red-950/95 border-2 border-red-500 text-red-200 text-xs rounded-xl flex items-start gap-2.5 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">
                      <strong className="block text-white font-bold mb-0.5">PAYMENT REQUIRED:</strong>
                      <span>{errorMsg}</span>
                    </div>
                  </div>
                )}

                {/* 20% Buyback Marketing Banner */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex flex-col gap-1 items-center text-center">
                  <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    20% Auto-Buyback & Pump 🚀
                  </span>
                  <span className="text-[10px] text-emerald-200/70">
                    20% of this payment is used to market-buy <strong className="text-emerald-300">$KOTS</strong>, and 100% of those tokens are airdropped back to you within 24 hours! 
                    Claim the throne ➔ We pump the coin ➔ Your bag grows!
                  </span>
                </div>

                {/* Click-Wrap Legal Consent (Mandatory) */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-1 pb-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-600 accent-yellow-500 flex-shrink-0"
                  />
                  <span className="text-[10px] text-gray-400 leading-relaxed">
                    I am 18+ years old, I certify I own rights to this content, and I agree to the{" "}
                    <span className="text-yellow-400 underline">Terms of Service</span>.{" "}
                    All micropayments are strictly final fees for billboard display time. Tokens are free novelty gifts with no intrinsic value.
                    I represent that I am not located in any OFAC-sanctioned jurisdiction.
                  </span>
                </label>

                {/* Submit CTA Button */}
                
                {/* WALLET STATUS & ACTION */}
                {!publicKey ? (
                   <div className="w-full flex justify-center mt-2">
                     <WalletMultiButton style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "56px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", justifyContent: "center", textTransform: "uppercase" }}>
                       CONNECT WALLET TO CONTINUE
                     </WalletMultiButton>
                   </div>
                ) : (
                  <button
                    type="button"
                    onClick={async (e) => { e.preventDefault(); await handleSubmit(e); }}
                    disabled={loading || isUploading || walletConnecting || !agreedToTerms}
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
                        <span>PAY ${bidAmount.toFixed(2)} & CLAIM THRONE</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}

              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
