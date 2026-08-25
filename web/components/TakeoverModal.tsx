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
  const [paymentMethod, setPaymentMethod] = useState<"DEMO" | "SOLANA" | "EVM">("DEMO");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    try {
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
          cryptoCurrency: paymentMethod === "SOLANA" ? "SOL" : paymentMethod === "EVM" ? "USDT" : "DEMO",
          paidCryptoAmount: paymentMethod === "SOLANA" ? bidAmount / 150 : bidAmount,
          txHash: `tx_${paymentMethod.toLowerCase()}_${Date.now()}`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#111119] border-2 border-yellow-500/70 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-black/60 hover:bg-black/90 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-bold rounded-full uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-red-500" />
            <span>GLOBAL THRONE CHALLENGE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-yellow-400">
            DETHRONE THE CURRENT KING
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-mono mt-1">
            Minimum required to rule: <strong className="text-emerald-400 font-bold">${nextMinPriceUsd.toFixed(2)}</strong>. You hold the screen until outbid!
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm font-mono">
          {/* Nickname & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full bg-black/70 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
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
                className="w-full bg-black/70 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
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
              className="w-full bg-black/70 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Media Image / GIF Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-300 font-bold">
                SCREEN IMAGE / GIF <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageSourceTab("UPLOAD")}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    imageSourceTab === "UPLOAD"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
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
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
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
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
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
                className="border-2 border-dashed border-cyber-border hover:border-yellow-500/80 bg-black/50 hover:bg-black/70 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  className="hidden"
                />
                {isUploading ? (
                  <div className="flex items-center gap-2 text-yellow-400 text-xs py-3">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading image to server...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-yellow-400/80" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Click to select photo / GIF or drag & drop here
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Supports PNG, JPG, GIF, WebP (up to 15MB)
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
                className="w-full bg-black/70 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
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
                    className={`text-[11px] p-2 rounded-lg border text-center transition-all ${
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

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={nextMinPriceUsd}
                step="1"
                value={bidAmount}
                onChange={(e) => setBidAmount(Math.max(nextMinPriceUsd, Number(e.target.value)))}
                className="w-36 bg-black/80 border-2 border-emerald-500/80 rounded-xl px-3.5 py-2 text-xl font-bold font-mono text-emerald-400 focus:outline-none"
              />
              <div className="flex gap-1.5">
                {[0, 5, 25, 100].map((add) => (
                  <button
                    key={add}
                    type="button"
                    onClick={() => setBidAmount(nextMinPriceUsd + add)}
                    className="text-xs px-2.5 py-2 bg-black/50 border border-cyber-border hover:border-emerald-500 text-gray-300 rounded-lg transition-colors"
                  >
                    +${add}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs text-gray-300 font-bold">
              PAYMENT METHOD
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("DEMO")}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                  paymentMethod === "DEMO"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "bg-black/40 border-cyber-border text-gray-400 hover:text-white"
                }`}
              >
                ⚡ 1-Click Demo Bid
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("SOLANA")}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                  paymentMethod === "SOLANA"
                    ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    : "bg-black/40 border-cyber-border text-gray-400 hover:text-white"
                }`}
              >
                🟣 Solana Pay (SOL)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("EVM")}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                  paymentMethod === "EVM"
                    ? "bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    : "bg-black/40 border-cyber-border text-gray-400 hover:text-white"
                }`}
              >
                🔷 Base / USDT
              </button>
            </div>

            {/* Crypto Address Details */}
            {paymentMethod === "SOLANA" && (
              <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-xl text-xs space-y-1.5">
                <div className="text-purple-300 font-bold">Solana Deposit Address:</div>
                <div className="flex items-center justify-between gap-2 bg-black/60 px-2 py-1.5 rounded text-[11px] text-gray-300 font-mono">
                  <span className="truncate">{walletConfig.solanaAddress}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(walletConfig.solanaAddress)}
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === "EVM" && (
              <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs space-y-1.5">
                <div className="text-blue-300 font-bold">EVM / Base / USDT Address:</div>
                <div className="flex items-center justify-between gap-2 bg-black/60 px-2 py-1.5 rounded text-[11px] text-gray-300 font-mono">
                  <span className="truncate">{walletConfig.evmAddress}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(walletConfig.evmAddress)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={loading || isUploading}
            className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.7)] text-base uppercase tracking-wider transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>CLAIMING THE THRONE...</span>
              </>
            ) : (
              <>
                <Flame className="w-5 h-5 fill-black" />
                <span>CLAIM THRONE FOR ${bidAmount.toFixed(2)}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
