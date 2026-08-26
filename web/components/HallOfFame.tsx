"use client";

import React, { useState } from "react";
import { King } from "@/lib/types";
import { Trophy, Clock, DollarSign, History, ExternalLink, Skull, Gem, Sparkles, X } from "lucide-react";
import { RoyalNFTCard } from "./RoyalNFTCard";

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
  const [selectedNFTKing, setSelectedNFTKing] = useState<{ king: King; index: number } | null>(null);

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
          <span>GRAVEYARD OF KINGS & 1-OF-25 NFT RELICS</span>
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
              tab === "LONGEST" ? "bg-yellow-500 text-black font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Longest Reign</span>
          </button>
          <button
            onClick={() => setTab("SPENDERS")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === "SPENDERS" ? "bg-yellow-500 text-black font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Top Tribute</span>
          </button>
        </div>
      </div>

      {/* List of Past Kings */}
      {displayList.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-xs">
          <Skull className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No Kings have fallen yet. Claim the throne to become Monarch #1!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((king, index) => (
            <div
              key={king.id || index}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-black/50 border border-cyber-border hover:border-yellow-500/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-cyber-border bg-black flex-shrink-0">
                  <img
                    src={king.mediaUrl}
                    alt={king.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded font-black border border-yellow-500/40">
                      #{index + 1}/25
                    </span>
                    <span className="font-bold text-white text-xs sm:text-sm truncate">
                      {king.nickname}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 truncate max-w-md italic">
                    "{king.tagline}"
                  </p>

                  {king.link && (
                    <a
                      href={king.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 inline-block truncate"
                    >
                      <span>{king.link}</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  )}
                </div>
              </div>

              {/* Stats & NFT Badge Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs border-t sm:border-t-0 pt-2 sm:pt-0 border-cyber-border/40">
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">
                    ${king.paidAmountUsd.toFixed(2)} USD
                  </span>
                  <span className="text-gray-500 text-[10px] block">
                    Reign: {formatReign(king.reignDurationSeconds)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNFTKing({ king, index: index + 1 })}
                  className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/50 hover:border-purple-400 rounded-lg text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                >
                  <Gem className="w-3.5 h-3.5 text-purple-400" />
                  <span>View NFT</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NFT Modal Popup when clicking 'View NFT' */}
      {selectedNFTKing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="relative w-full max-w-sm">
            <button
              type="button"
              onClick={() => setSelectedNFTKing(null)}
              className="absolute -top-3 -right-3 p-2 bg-black text-gray-300 hover:text-white rounded-full border border-yellow-500 z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <RoyalNFTCard
              king={selectedNFTKing.king}
              ordinalNumber={selectedNFTKing.index}
              totalCap={25}
            />
          </div>
        </div>
      )}
    </div>
  );
};
