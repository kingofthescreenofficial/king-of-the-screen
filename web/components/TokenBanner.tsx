"use client";

import React, { useState } from "react";
import { TokenConfig } from "@/lib/types";
import { Coins, Copy, Check, ExternalLink, TrendingUp, Sparkles, Flame } from "lucide-react";

interface TokenBannerProps {
  tokenConfig?: TokenConfig;
}

export const TokenBanner: React.FC<TokenBannerProps> = ({ tokenConfig }) => {
  const [copied, setCopied] = useState(false);

  if (!tokenConfig) return null;

  const copyCA = () => {
    navigator.clipboard.writeText(tokenConfig.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-3 p-1 bg-gradient-to-r from-yellow-500/80 via-emerald-500/80 to-purple-600/80 rounded-2xl shadow-[0_0_25px_rgba(234,179,8,0.25)] font-mono">
      <div className="bg-[#0e0e17] rounded-[14px] p-3.5 sm:p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Token Info & Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-yellow-500/60 bg-black flex-shrink-0 relative shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <img
              src="/king_token_logo.jpg"
              alt="KING Token"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>${tokenConfig.ticker}</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold">
                  SOLANA LIVE
                </span>
              </span>
            </div>
            <span className="text-xs text-gray-400 block truncate">
              {tokenConfig.name} • 100% Mined by 25 Kings
            </span>
          </div>
        </div>

        {/* Center: Contract Address (CA) with 1-Click Copy */}
        <div className="flex items-center gap-2 bg-black/80 border border-cyber-border hover:border-yellow-500/50 px-3 py-2 rounded-xl text-xs w-full md:w-auto justify-between transition-colors">
          <div className="flex items-center gap-1.5 min-w-0 text-gray-300">
            <span className="text-yellow-400 font-black text-[10px]">CA:</span>
            <span className="font-mono text-gray-300 truncate max-w-[150px] sm:max-w-[200px]">
              {tokenConfig.contractAddress}
            </span>
          </div>

          <button
            type="button"
            onClick={copyCA}
            className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-md font-bold text-[10px] transition-colors flex-shrink-0"
            title="Copy Contract Address"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Trading & Chart Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <a
            href={tokenConfig.pumpFunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 fill-black" />
            <span>TRADE ON PUMP.FUN</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={tokenConfig.dexScreenerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none px-3.5 py-2 bg-black/60 hover:bg-black/90 border border-cyber-border hover:border-yellow-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
            <span>CHART</span>
          </a>
        </div>
      </div>
    </div>
  );
};
