"use client";

import React, { useRef } from "react";
import { King } from "@/lib/types";
import { Crown, Sparkles, Share2, ShieldCheck, Flame, Zap, Award, Gem } from "lucide-react";

interface RoyalNFTCardProps {
  king: King;
  ordinalNumber?: number; // e.g. 1 of 25
  totalCap?: number; // 25
  onClose?: () => void;
}

export const RoyalNFTCard: React.FC<RoyalNFTCardProps> = ({
  king,
  ordinalNumber = 1,
  totalCap = 25,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const formatReignTime = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "Reigning Now 👑";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const shareToTwitter = () => {
    const text = `👑 I AM OFFICIALLY CROWNED AS GENESIS MONARCH #${ordinalNumber} OF ${totalCap} on @kingofthescreen!\n\n💎 Rule: Held the global $1,000,000 screen & mined 25,000 $KING tokens.\n\nVerify on-chain relic: https://king-of-the-screen.vercel.app/api/nft/${ordinalNumber}\n\n#KingOfTheScreen #Solana #Base #NFT`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // If user used default stock image, showcase the official 3D royal crown emblem
  const displayImage =
    king.mediaUrl && !king.mediaUrl.includes("unsplash.com/photo-1618005182384")
      ? king.mediaUrl
      : "/king_token_logo.jpg";

  return (
    <div className="relative max-w-sm w-full mx-auto p-1 bg-gradient-to-b from-yellow-300 via-amber-500 to-purple-600 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.5)] font-mono text-white transition-all hover:scale-[1.02] duration-300">
      <div
        ref={cardRef}
        className="bg-[#090910] rounded-[22px] p-5 border border-yellow-400/60 space-y-4 relative overflow-hidden backdrop-blur-xl"
      >
        {/* Holographic animated lighting */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-yellow-400/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Card Top Banner: Series & On-Chain Badge */}
        <div className="flex items-center justify-between border-b border-yellow-500/30 pb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500/30 to-amber-500/20 border border-yellow-400/60 rounded-full text-yellow-300 text-[11px] font-black tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.3)]">
            <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>GENESIS MONARCH #{ordinalNumber}/{totalCap}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>1-OF-25 RELIC</span>
          </div>
        </div>

        {/* NFT Artwork Frame (Cyberpunk Gold Bevel) */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-yellow-400/70 bg-black shadow-[0_0_25px_rgba(0,0,0,0.8)] group">
          <img
            src={displayImage}
            alt={king.nickname}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Rarity & Tribute Overlay */}
          <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-yellow-500/40 flex items-center gap-1 text-[10px] text-yellow-300 font-black">
            <Gem className="w-3 h-3 text-purple-400" />
            <span>ULTRA RARE GENESIS</span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 flex items-center justify-between text-xs">
            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">TRIBUTE VALUE:</span>
            <span className="text-yellow-400 font-black text-sm">${king.paidAmountUsd.toFixed(2)} USD</span>
          </div>
        </div>

        {/* King Nickname & Royal Decree */}
        <div className="space-y-1 text-center pt-1">
          <div className="flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xl font-black text-white tracking-tight truncate">
              {king.nickname}
            </h3>
          </div>
          <p className="text-xs text-yellow-200/90 italic font-sans px-2">
            "{king.tagline}"
          </p>
        </div>

        {/* Proof & Mining Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 bg-black/70 p-3 rounded-xl border border-cyber-border text-xs">
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">REIGN STATUS</span>
            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[11px]">{formatReignTime(king.reignDurationSeconds)}</span>
            </span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">$KING MINED</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span className="text-[11px]">+{((king.paidAmountUsd || 1) * 25000).toLocaleString()} $KING</span>
            </span>
          </div>
        </div>

        {/* Metadata & On-Chain Proof */}
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-[10px] text-gray-300 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-gray-500">Token ID:</span>
            <span className="text-yellow-300 font-bold">KING-GENESIS-#{ordinalNumber.toString().padStart(2, "0")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Metadata URI:</span>
            <a
              href={`/api/nft/${ordinalNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline truncate max-w-[180px]"
            >
              /api/nft/{ordinalNumber}
            </a>
          </div>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={shareToTwitter}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 transition-all active:scale-98 uppercase tracking-wider"
          >
            <Share2 className="w-4 h-4" />
            <span>FLEX CROWN ON X (TWITTER)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
