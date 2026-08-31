"use client";

import React from "react";
import { Zap, Crown, Trophy, Sparkles, ArrowRight, ShieldCheck, Flame, Coins, Gem } from "lucide-react";

interface ConceptHeroProps {
  onOpenTakeover: () => void;
  nextMinPriceUsd: number;
}

export const ConceptHero: React.FC<ConceptHeroProps> = ({ onOpenTakeover, nextMinPriceUsd }) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-4 bg-gradient-to-b from-[#141422] to-[#0d0d15] border-2 border-yellow-500/50 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden font-mono">
      {/* Decorative ambient corner glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Headline & Punchy Concept Statement */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>GAMEFI & SOCIAL BILLBOARD 2.0</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
          THE $1M THRONE: RULE, <span className="text-emerald-400">MINE $KOTS</span> & CLAIM YOUR <span className="text-yellow-400">1-OF-100 NFT</span>
        </h2>

        <p className="text-xs sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
          One global screen. Pay to broadcast your image & link worldwide.{" "}
          <strong className="text-emerald-400">
            Every King automatically mines $KOTS tokens and mints a historical 1-of-100 Genesis NFT!
          </strong>
        </p>
      </div>

      {/* 3 Step Actionable Flow */}
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

      {/* Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-yellow-500/20">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Instant 1-Click Solana micro-payments</span>
        </div>

        <button
          type="button"
          onClick={onOpenTakeover}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span>CLAIM THRONE & MINE $KOTS (${nextMinPriceUsd.toFixed(2)})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
