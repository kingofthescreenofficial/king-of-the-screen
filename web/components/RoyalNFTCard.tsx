"use client";

import React, { useRef } from "react";
import { King } from "@/lib/types";
import { Crown, Sparkles, Download, Share2, ShieldCheck, Flame } from "lucide-react";

interface RoyalNFTCardProps {
  king: King;
  ordinalNumber?: number; // e.g. 2 of 25
  totalCap?: number; // 25
  onClose?: () => void;
}

export const RoyalNFTCard: React.FC<RoyalNFTCardProps> = ({
  king,
  ordinalNumber = 2,
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
    const text = `I am immortalized as King #${ordinalNumber} of ${totalCap} on @kingofthescreen! 👑\n\nRule: Held the screen with $${king.paidAmountUsd} & mined $KING tokens.\n\nCheck the live monument: https://king-of-the-screen.vercel.app/\n\n#KingOfTheScreen #Base #Solana #NFT`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="relative max-w-sm w-full mx-auto p-1 bg-gradient-to-b from-yellow-500 via-amber-500/40 to-yellow-600/80 rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.4)] font-mono text-white">
      <div
        ref={cardRef}
        className="bg-[#0b0b12] rounded-[14px] p-4.5 sm:p-5 border border-yellow-500/50 space-y-4 relative overflow-hidden"
      >
        {/* Ambient Hologram Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header: Ordinal + Status */}
        <div className="flex items-center justify-between border-b border-yellow-500/30 pb-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-[10px] font-black uppercase tracking-wider">
            <Crown className="w-3 h-3 text-yellow-400" />
            <span>GENESIS MONARCH #{ordinalNumber}/{totalCap}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED ON-CHAIN</span>
          </div>
        </div>

        {/* Media Frame */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-yellow-500/60 bg-black shadow-inner">
          <img
            src={king.mediaUrl}
            alt={king.nickname}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center justify-between text-xs">
            <span className="text-gray-300 text-[10px]">TRIBUTE VALUE:</span>
            <span className="text-yellow-400 font-black">${king.paidAmountUsd.toFixed(2)} USD</span>
          </div>
        </div>

        {/* King Nickname & Message */}
        <div className="space-y-1 text-center">
          <h3 className="text-lg font-black text-white truncate">
            {king.nickname}
          </h3>
          <p className="text-xs text-gray-300 italic line-clamp-2 px-1">
            "{king.tagline}"
          </p>
        </div>

        {/* Proof & Stats Grid */}
        <div className="grid grid-cols-2 gap-2 bg-black/60 p-2.5 rounded-xl border border-cyber-border/60 text-[11px]">
          <div>
            <span className="text-[9px] text-gray-500 block uppercase">REIGN TIME</span>
            <span className="font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>{formatReignTime(king.reignDurationSeconds)}</span>
            </span>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 block uppercase">$KING MINED</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-emerald-400" />
              <span>+{(king.paidAmountUsd * 25000).toLocaleString()} $KING</span>
            </span>
          </div>
        </div>

        {/* Share & Bragging Action */}
        <div className="pt-1">
          <button
            type="button"
            onClick={shareToTwitter}
            className="w-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-400 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>FLEX ON X (TWITTER)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
