"use client";

import React, { useState } from "react";
import { King } from "@/lib/types";
import { Trophy, Clock, DollarSign, History, ExternalLink, Skull } from "lucide-react";

interface HallOfFameProps {
  hallOfFame: King[];
  recentEvents: Array<{
    id: string;
    type: string;
    text: string;
    timestamp: number;
  }>;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ hallOfFame, recentEvents }) => {
  const [tab, setTab] = useState<"HISTORY" | "LONGEST" | "SPENDERS">("HISTORY");

  const formatReign = (sec?: number) => {
    if (!sec || sec < 1) return "< 1s";
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${s}s`;
    if (mins > 0) return `${mins}m ${s}s`;
    return `${s}s`;
  };

  const sortedByLongest = [...hallOfFame].sort(
    (a, b) => (b.reignDurationSeconds || 0) - (a.reignDurationSeconds || 0)
  );

  const sortedByAmount = [...hallOfFame].sort((a, b) => b.paidAmountUsd - a.paidAmountUsd);

  const displayList =
    tab === "LONGEST" ? sortedByLongest : tab === "SPENDERS" ? sortedByAmount : hallOfFame;

  return (
    <div className="w-full max-w-5xl mx-auto my-8 bg-cyber-card border border-cyber-border rounded-2xl p-4 sm:p-6 shadow-xl text-white font-mono">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyber-border pb-4 mb-4">
        <div className="flex items-center gap-2 text-gold-400 font-bold text-base sm:text-lg">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>GRAVEYARD OF KINGS & HALL OF FAME</span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-cyber-border text-xs">
          <button
            onClick={() => setTab("HISTORY")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === "HISTORY" ? "bg-yellow-500 text-black font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setTab("LONGEST")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === "LONGEST" ? "bg-purple-500 text-white font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Longest Reign</span>
          </button>
          <button
            onClick={() => setTab("SPENDERS")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === "SPENDERS" ? "bg-emerald-500 text-black font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Top Spenders</span>
          </button>
        </div>
      </div>

      {/* List content */}
      {displayList.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <Skull className="w-12 h-12 mx-auto mb-2 text-gray-600" />
          <p>No fallen monarchs yet. Be the first to dethrone the Sovereign!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {displayList.map((king, idx) => (
            <div
              key={king.id || idx}
              className="bg-black/40 border border-cyber-border/70 hover:border-gold-500/50 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-cyber-border bg-black flex-shrink-0">
                  <img
                    src={king.mediaUrl}
                    alt={king.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{king.nickname}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(king.crownedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 italic">"{king.tagline}"</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-cyber-border/40">
                <div className="text-purple-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ruled: <strong>{formatReign(king.reignDurationSeconds)}</strong></span>
                </div>
                <div className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
                  ${king.paidAmountUsd.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
