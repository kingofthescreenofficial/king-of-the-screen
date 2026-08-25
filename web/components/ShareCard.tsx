"use client";

import React, { useState } from "react";
import { King } from "@/lib/types";
import { Share2, Twitter, Copy, Check, Sparkles } from "lucide-react";

interface ShareCardProps {
  currentKing: King;
  nextMinPriceUsd: number;
}

export const ShareCard: React.FC<ShareCardProps> = ({ currentKing, nextMinPriceUsd }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `👑 ${currentKing.nickname} is currently the KING OF THE SCREEN ($${currentKing.paidAmountUsd.toFixed(2)}).\n\nCan anyone dethrone them for $${nextMinPriceUsd.toFixed(2)}?\n\nTake the screen:`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://kingofthescreen.xyz";

  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 bg-gradient-to-r from-purple-950/40 via-black to-slate-900/40 border border-purple-900/50 rounded-2xl p-4 sm:p-6 text-white font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-400">
          <Share2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-purple-200">
            FLEX & SPREAD THE CHAOS
          </h4>
          <p className="text-xs text-gray-400">
            Challenge your friends or rival crypto communities to take over the screen.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <a
          href={twitterIntentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/50 text-[#1DA1F2] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(29,161,242,0.2)]"
        >
          <Twitter className="w-4 h-4 fill-current" />
          <span>Post to X</span>
        </a>

        <button
          onClick={handleCopy}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-black/50 hover:bg-black/80 border border-cyber-border text-gray-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>
    </div>
  );
};
