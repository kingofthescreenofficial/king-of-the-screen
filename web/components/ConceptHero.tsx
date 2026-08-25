"use client";

import React from "react";
import { Zap, Crown, Trophy, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface ConceptHeroProps {
  onOpenTakeover: () => void;
  nextMinPriceUsd: number;
}

export const ConceptHero: React.FC<ConceptHeroProps> = ({ onOpenTakeover, nextMinPriceUsd }) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-4 bg-gradient-to-b from-[#141422] to-[#0d0d15] border-2 border-yellow-500/50 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden font-mono">
      {/* Decorative ambient corner glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Headline & Punchy Concept Statement */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>GLOBAL LIVE SOCIAL EXPERIMENT</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
          THE WORLD'S MOST CONTESTED <span className="text-yellow-400 text-glow-gold">DIGITAL BILLBOARD</span>
        </h2>

        <p className="text-xs sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
          One global screen. Pay to broadcast your image, message, and link to the entire world.{" "}
          <strong className="text-yellow-400 underline decoration-yellow-500/50">
            You hold the broadcast 24/7 until another challenger outbids you!
          </strong>
        </p>
      </div>

      {/* 3 Step Visual Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
        {/* Step 1 */}
        <div className="bg-black/60 border border-cyber-border/80 hover:border-yellow-500/60 p-4 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-black border border-yellow-500/40">
              1
            </span>
            <Zap className="w-4 h-4" />
            <span>Claim the Throne</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Upload your image or GIF, craft your punchy message, and attach your project or social link.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-black/60 border border-cyber-border/80 hover:border-purple-500/60 p-4 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-black border border-purple-500/40">
              2
            </span>
            <Crown className="w-4 h-4" />
            <span>Rule 24/7 Worldwide</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            No 60-second limit. You hold the global live broadcast indefinitely until someone pays higher.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-black/60 border border-cyber-border/80 hover:border-emerald-500/60 p-4 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-black border border-emerald-500/40">
              3
            </span>
            <Trophy className="w-4 h-4" />
            <span>Etched in History</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your total reign duration and spent amount are permanently archived in the Graveyard of Kings.
          </p>
        </div>
      </div>

      {/* Quick Action Footer inside Hero */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-cyber-border/60">
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Direct non-custodial Base / Ethereum / USDT / Demo payments • No intermediaries</span>
        </div>

        <button
          onClick={onOpenTakeover}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(234,179,8,0.5)]"
        >
          <span>CLAIM THRONE FROM ${nextMinPriceUsd.toFixed(2)}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
