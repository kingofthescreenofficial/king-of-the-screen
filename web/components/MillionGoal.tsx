"use client";

import React from "react";
import { Target, TrendingUp, ShieldCheck, Zap, Award } from "lucide-react";

interface MillionGoalProps {
  totalRaisedUsd: number;
  totalDethronements: number;
  longestReignSeconds: number;
  longestReignKing: string;
  targetGoalUsd?: number;
}

export const MillionGoal: React.FC<MillionGoalProps> = ({
  totalRaisedUsd,
  totalDethronements,
  longestReignSeconds,
  longestReignKing,
  targetGoalUsd = 1000000,
}) => {
  const percentage = Math.min(100, (totalRaisedUsd / targetGoalUsd) * 100);
  const formattedRaised = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(totalRaisedUsd);

  const formatReign = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 bg-cyber-card border border-cyber-border rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with numbers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
            <Target className="w-4 h-4" />
            <span>GLOBAL MONUMENT PROGRESS</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-black font-mono text-white text-glow-green">
              {formattedRaised}
            </span>
            <span className="text-sm font-mono text-gray-400">
              / $1,000,000.00
            </span>
          </div>
        </div>

        {/* Mini Stats badges */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-4 font-mono text-xs">
          <div className="bg-black/50 border border-cyber-border px-3 py-2 rounded-xl">
            <div className="text-gray-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Dethronements</span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">{totalDethronements}</div>
          </div>

          <div className="bg-black/50 border border-cyber-border px-3 py-2 rounded-xl">
            <div className="text-gray-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Longest Reign</span>
            </div>
            <div className="text-sm font-bold text-purple-300 mt-0.5" title={longestReignKing}>
              {formatReign(longestReignSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* The Animated Progress Bar */}
      <div className="relative w-full h-5 bg-black/80 rounded-full overflow-hidden border border-cyber-border p-0.5 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] relative"
          style={{ width: `${Math.max(1, percentage)}%` }}
        />
      </div>

      {/* Milestones Labels */}
      <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2 px-1">
        <span>$0</span>
        <span>$10,000</span>
        <span>$100,000</span>
        <span>$500,000</span>
        <span className="text-gold-400 font-bold">$1,000,000 (VICTORY)</span>
      </div>

      {/* On-Chain Transparency Guarantee */}
      <div className="mt-4 pt-3 border-t border-cyber-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Non-Custodial Direct Transfers</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="bg-purple-950/60 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded">
            ⚡ Solana Instant Finality
          </span>
          <span className="bg-blue-950/60 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded">
            💎 Base / EVM / USDT
          </span>
        </div>
      </div>
    </div>
  );
};
