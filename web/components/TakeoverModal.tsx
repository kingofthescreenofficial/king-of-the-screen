"use client";

import React, { useState, useRef, useEffect } from "react";
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
  AlertCircle,
  RefreshCw,
  Trash2,
  Wallet,
  Zap,
  ExternalLink,
} from "lucide-react";
import { AppState } from "@/lib/types";

interface TakeoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextMinPriceUsd: number;
  walletConfig: AppState["walletConfig"];
  onSuccess: (updatedState: AppState) => void;
}

const MEME_PRESETS = [
  {
    name: "👑 Cyber Gold",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "🚀 Neon Rocket",
    url: "https://images.unsplash.com/photo-1517976487502-d17e997f8c0d?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "⚡ Cyberpunk Matrix",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "💎 Diamond Bull",
    url: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=1200&auto=format&fit=crop&q=80",
  },
];

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
  const [mediaUrl, setMediaUrl] = useState(MEME_PRESETS[0].url);
  const [imageSourceTab, setImageSourceTab] = useState<"UPLOAD" | "URL" | "PRESETS">("UPLOAD");
  const [bidAmount, setBidAmount] = useState<number>(nextMinPriceUsd);
  const [paymentMethod, setPaymentMethod] = useState<"EVM" | "SOLANA">("EVM");
  const [txHashInput, setTxHashInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
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

  // 1-Click In-Browser Web3 Payment (MetaMask, TrustWallet, Rabby, Coinbase)
  const handleDirectWeb3Pay = async () => {
    setErrorMsg(null);

    if (!nickname.trim()) {
      setErrorMsg("Please enter your King Nickname first.");
      return;
    }
    if (!tagline.trim()) {
      setErrorMsg("Please enter your Message first.");
      return;
    }
    if (!mediaUrl.trim()) {
      setErrorMsg("Please select an image first.");
      return;
    }

    if (typeof window !== "undefined" && (window as any).ethereum) {
      setWalletConnecting(true);
      try {
        const provider = (window as any).ethereum;
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        const userAccount = accounts[0];

        // Approximate ETH value (assuming ~$2500 per ETH for micro-gas or Base transfer)
        // For sub-dollar microbids: value in wei
        const ethPriceApprox = 2500;
        const ethAmount = bidAmount / ethPriceApprox;
        const weiHex = "0x" + BigInt(Math.floor(ethAmount * 1e18)).toString(16);

        const txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: userAccount,
              to: walletConfig.evmAddress,
              value: weiHex,
            },
          ],
        });

        if (txHash) {
          setTxHashInput(txHash);
          // Auto submit takeover with real on-chain hash!
          await processTakeover(txHash);
        }
      } catch (err: any) {
        if (err.code === 4001) {
          setErrorMsg("Transaction was rejected by user.");
        } else {
          setErrorMsg(err.message || "Failed to trigger wallet transaction.");
        }
      } finally {
        setWalletConnecting(false);
      }
    } else {
      // Mobile wallet deep linking fallback
      const currentUrl = encodeURIComponent("https://king-of-the-screen.vercel.app");
      const metaMaskUrl = `https://metamask.app.link/dapp/king-of-the-screen.vercel.app`;
      window.open(metaMaskUrl, "_blank");
    }
  };

  // Handle local file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setErrorMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      setMediaUrl(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload image. Please try again or paste a link.");
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

  const processTakeover = async (hash?: string) => {
    setLoading(true);
    try {
      const finalTxHash = (hash || txHashInput).trim() || `tx_${paymentMethod.toLowerCase()}_${Date.now()}`;

      const res = await fetch("/api/takeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          tagline,
          link: link.trim() || undefined,
          mediaUrl,
          mediaType: "image",
          paidAmountUsd: bidAmount,
          cryptoCurrency: paymentMethod === "SOLANA" ? "SOL" : "USDT",
          paidCryptoAmount: paymentMethod === "SOLANA" ? Number((bidAmount / 150).toFixed(4)) : bidAmount,
          txHash: finalTxHash,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Takeover failed. Try again.");
      } else {
        triggerConfetti();
        onSuccess(data.state);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      setErrorMsg(`Bid must be at least $${nextMinPriceUsd.toFixed(2)}`);
      return;
    }

    await processTakeover();
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

            {/* Media Image / GIF Section */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="text-xs text-gray-300 font-bold">
                  SCREEN IMAGE / GIF <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImageSourceTab("UPLOAD")}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      imageSourceTab === "UPLOAD"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-bold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceTab("URL")}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      imageSourceTab === "URL"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-bold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Direct URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceTab("PRESETS")}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      imageSourceTab === "PRESETS"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-bold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Presets</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: Local File Upload */}
              {imageSourceTab === "UPLOAD" && (
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
                      <span>Uploading image to server...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-yellow-400/80" />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Tap to select photo / GIF from device
                        </span>
                        <span className="text-[11px] text-gray-500">
                          PNG, JPG, GIF, WebP (up to 15MB)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: Direct URL Input */}
              {imageSourceTab === "URL" && (
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/my-meme.gif"
                  className="w-full bg-black/70 border border-cyber-border rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              )}

              {/* TAB 3: Presets */}
              {imageSourceTab === "PRESETS" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MEME_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setMediaUrl(preset.url)}
                      className={`text-[11px] p-2.5 rounded-lg border text-center transition-all ${
                        mediaUrl === preset.url
                          ? "bg-yellow-500/20 border-yellow-500 text-yellow-300 font-bold"
                          : "bg-black/50 border-cyber-border text-gray-400 hover:text-white"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Live Image Preview */}
              {mediaUrl && (
                <div className="flex items-center gap-3 bg-black/60 border border-cyber-border p-2 rounded-xl mt-2">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-cyber-border bg-black flex-shrink-0">
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-emerald-400 block">
                      ✓ Image selected for the screen
                    </span>
                    <span className="text-[11px] text-gray-500 truncate block">
                      {mediaUrl.startsWith("data:") ? "Custom uploaded image" : mediaUrl}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Bid Amount Selector */}
            <div className="pt-2 border-t border-cyber-border">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-300 font-bold">
                  BID AMOUNT ($ USD)
                </label>
                <span className="text-xs text-emerald-400 font-bold">
                  Min: ${nextMinPriceUsd.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={nextMinPriceUsd}
                  step="1"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Math.max(nextMinPriceUsd, Number(e.target.value)))}
                  className="w-36 bg-black/80 border-2 border-emerald-500/80 rounded-xl px-3.5 py-2.5 text-xl font-bold font-mono text-emerald-400 focus:outline-none"
                />
                <div className="flex gap-1.5">
                  {[0, 5, 25, 100].map((add) => (
                    <button
                      key={add}
                      type="button"
                      onClick={() => setBidAmount(nextMinPriceUsd + add)}
                      className="text-xs px-3 py-2.5 bg-black/50 border border-cyber-border hover:border-emerald-500 text-gray-300 rounded-lg transition-colors font-bold"
                    >
                      +${add}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* REAL CRYPTO PAYMENT METHOD SELECTOR */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs text-gray-300 font-bold flex items-center justify-between">
                <span>SELECT CRYPTO PAYMENT NETWORK</span>
                <span className="text-[10px] text-emerald-400">Direct non-custodial</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("EVM")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                    paymentMethod === "EVM"
                      ? "bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : "bg-black/40 border-cyber-border text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-sm">🔷 Base / USDT / ETH</span>
                  <span className="text-[10px] text-gray-400 font-normal">Sub-cent fee on Base</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("SOLANA")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                    paymentMethod === "SOLANA"
                      ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "bg-black/40 border-cyber-border text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-sm">🟣 Solana (SOL)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Fast 400ms finality</span>
                </button>
              </div>

              {/* 1-CLICK INSTANT WEB3 BUTTON */}
              {paymentMethod === "EVM" && (
                <div className="p-3 bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>Instant 1-Click Pay</span>
                    </span>
                    <span className="text-[10px] text-blue-300">Opens MetaMask / TrustWallet</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDirectWeb3Pay}
                    disabled={walletConnecting || loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    {walletConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>OPENING WALLET APP...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        <span>PAY ${bidAmount.toFixed(2)} WITH WALLET APP</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* EVM Deposit Address Box */}
              {paymentMethod === "EVM" && (
                <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300 font-bold flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-blue-400" />
                      <span>Or Manual Transfer to Address:</span>
                    </span>
                    <span className="text-[10px] text-gray-400">Base, ETH, BSC, Polygon</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-black/80 px-3 py-2.5 rounded-lg text-xs text-white font-mono border border-blue-500/30">
                    <span className="truncate">{walletConfig.evmAddress}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(walletConfig.evmAddress)}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 flex-shrink-0 font-bold"
                    >
                      {copiedAddress ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedAddress ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Transaction Hash (txHash) / Proof (Optional):
                    </label>
                    <input
                      type="text"
                      value={txHashInput}
                      onChange={(e) => setTxHashInput(e.target.value)}
                      placeholder="0x... paste transaction hash if sent manually"
                      className="w-full bg-black/90 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Solana Deposit Address Box */}
              {paymentMethod === "SOLANA" && (
                <div className="p-3.5 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 font-bold flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-purple-400" />
                      <span>Send ~{(bidAmount / 150).toFixed(3)} SOL to:</span>
                    </span>
                    <span className="text-[10px] text-gray-400">Solana Mainnet</span>
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
                      Solana Signature / txHash (Optional):
                    </label>
                    <input
                      type="text"
                      value={txHashInput}
                      onChange={(e) => setTxHashInput(e.target.value)}
                      placeholder="Paste your Solana transaction signature"
                      className="w-full bg-black/90 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 font-mono"
                    />
                  </div>
                </div>
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

            {/* Legal Compliance Notice */}
            <div className="text-[10px] text-gray-500 text-center leading-relaxed pt-1">
              By submitting, you certify you own rights to this content and agree to the Terms of Service.{" "}
              All micropayments are strictly final fees for live billboard display time (No financial returns).
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading || isUploading}
              className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.7)] text-base uppercase tracking-wider transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>CLAIMING THE THRONE...</span>
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5 fill-black" />
                  <span>CONFIRM & CLAIM THRONE FOR ${bidAmount.toFixed(2)}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
