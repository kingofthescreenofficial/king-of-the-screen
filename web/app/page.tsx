"use client";

import React, { useEffect, useState, useRef } from "react";
import { AppState } from "@/lib/types";
import { TheScreen } from "@/components/TheScreen";
import { MillionGoal } from "@/components/MillionGoal";
import { TakeoverModal } from "@/components/TakeoverModal";
import { HallOfFame } from "@/components/HallOfFame";
import { LiveAudio } from "@/components/LiveAudio";
import { ShareCard } from "@/components/ShareCard";
import { LiveViewerBadge } from "@/components/LiveViewerBadge";
import { LegalModal } from "@/components/LegalModal";
import { Crown, Flame, Info, Scale } from "lucide-react";

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);
  const [isTakeoverOpen, setIsTakeoverOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<"TOS" | "DISCLAIMER" | "DMCA" | "PRIVACY">("TOS");
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const lastStateHashRef = useRef<string>("");

  // Poll state every 2.5s for instant sync
  const fetchState = async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (res.ok) {
        const data: AppState = await res.json();
        const stateHash = `${data.currentKing.id}_${data.stats.totalRaisedUsd}_${data.nextMinPriceUsd}_${data.hallOfFame.length}`;

        if (stateHash !== lastStateHashRef.current) {
          lastStateHashRef.current = stateHash;
          setState(data);
          if (data.recentEvents && data.recentEvents.length > 0) {
            setLastEventId(data.recentEvents[0].id);
          }
        }
      }
    } catch (e) {
      console.warn("State polling error:", e);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2500);
    return () => clearInterval(interval);
  }, []);

  const openLegal = (tab: "TOS" | "DISCLAIMER" | "DMCA" | "PRIVACY") => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-[#08080c] flex flex-col items-center justify-center text-white font-mono">
        <Crown className="w-12 h-12 text-yellow-400 mb-4" />
        <p className="text-sm tracking-widest text-gray-400">CONNECTING TO GLOBAL BROADCAST...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#08080c] text-white px-4 py-6 sm:py-8 selection:bg-yellow-500 selection:text-black font-mono">
      {/* Sound & TTS Engine */}
      <LiveAudio
        lastEventId={lastEventId}
        newKingName={state.currentKing.nickname}
        newKingAmount={state.currentKing.paidAmountUsd}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Branding & Status Navigation */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-400">
                <Crown className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-glow-gold">
                KING OF THE SCREEN
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-mono mt-1">
              One screen. One ruler. Hold it until you get dethroned.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Isolated Live Indicator */}
            <LiveViewerBadge />

            {/* Quick Action Button */}
            <button
              onClick={() => setIsTakeoverOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-colors"
            >
              <Flame className="w-4 h-4 fill-black" />
              <span>CLAIM THRONE</span>
            </button>
          </div>
        </header>

        {/* The Central Screen Component */}
        <TheScreen
          king={state.currentKing}
          nextMinPriceUsd={state.nextMinPriceUsd}
          onOpenTakeover={() => setIsTakeoverOpen(true)}
        />

        {/* Viral Share Banner */}
        <ShareCard
          currentKing={state.currentKing}
          nextMinPriceUsd={state.nextMinPriceUsd}
        />

        {/* The Million Dollar Progress Engine */}
        <MillionGoal
          totalRaisedUsd={state.stats.totalRaisedUsd}
          totalDethronements={state.stats.totalDethronements}
          longestReignSeconds={state.stats.longestReignSeconds}
          longestReignKing={state.stats.longestReignKing}
          targetGoalUsd={state.stats.targetGoalUsd}
        />

        {/* Graveyard / Hall of Fame Leaderboard */}
        <HallOfFame
          hallOfFame={state.hallOfFame}
          recentEvents={state.recentEvents}
        />

        {/* How It Works Explainer Box */}
        <div className="w-full max-w-5xl mx-auto my-8 bg-black/40 border border-cyber-border rounded-2xl p-6 font-mono text-xs text-gray-400 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>HOW THE GLOBAL AUCTION WORKS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-300">
            <div className="bg-cyber-card/50 p-3.5 rounded-xl border border-cyber-border">
              <strong className="text-yellow-400 block mb-1">1. Take the Throne</strong>
              Pay the required minimum bid in Solana (SOL), Base/USDT, or Demo mode to broadcast your message, link, and visual.
            </div>

            <div className="bg-cyber-card/50 p-3.5 rounded-xl border border-cyber-border">
              <strong className="text-purple-400 block mb-1">2. Rule Until Dethroned</strong>
              There is NO 60-second limit. You hold the screen 24/7 across the global feed until another challenger outbids you.
            </div>

            <div className="bg-cyber-card/50 p-3.5 rounded-xl border border-cyber-border">
              <strong className="text-emerald-400 block mb-1">3. Immortality in Hall of Fame</strong>
              When dethroned, your total reign duration and spent amount are permanently etched into the Graveyard of Kings.
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE LEGAL & COMPLIANCE FOOTER */}
        <footer className="text-center text-[11px] font-mono text-gray-500 pt-8 pb-12 border-t border-cyber-border/40 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 text-xs">
            <button
              onClick={() => openLegal("TOS")}
              className="hover:text-yellow-400 underline transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => openLegal("DISCLAIMER")}
              className="hover:text-yellow-400 underline transition-colors"
            >
              Financial Disclaimer
            </button>
            <span>•</span>
            <button
              onClick={() => openLegal("DMCA")}
              className="hover:text-yellow-400 underline transition-colors"
            >
              DMCA & Safety Policy
            </button>
            <span>•</span>
            <button
              onClick={() => openLegal("PRIVACY")}
              className="hover:text-yellow-400 underline transition-colors"
            >
              Privacy Policy
            </button>
          </div>

          <p className="max-w-2xl mx-auto text-[10px] text-gray-600 leading-relaxed">
            LEGAL NOTICE: King of the Screen is an interactive digital advertising billboard and live social art performance. 
            All submitted micro-payments are strictly final and non-refundable fees for real-time digital billboard broadcast time. 
            This service does not constitute investment advice, profit sharing, lotteries, or securities.
          </p>

          <p className="text-[10px] text-gray-600">
            © 2026 KING OF THE SCREEN. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Takeover Modal */}
      <TakeoverModal
        isOpen={isTakeoverOpen}
        onClose={() => setIsTakeoverOpen(false)}
        nextMinPriceUsd={state.nextMinPriceUsd}
        walletConfig={state.walletConfig}
        onSuccess={(newState) => setState(newState)}
      />

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        defaultTab={legalTab}
      />
    </main>
  );
}
