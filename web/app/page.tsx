"use client";

import React, { useEffect, useState, useRef } from "react";
import { PublicAppState } from "@/lib/types";
import { TheScreen } from "@/components/TheScreen";
import { ConceptHero } from "@/components/ConceptHero";
import { TokenBanner } from "@/components/TokenBanner";
import { MillionGoal } from "@/components/MillionGoal";
import { TakeoverModal } from "@/components/TakeoverModal";
import { HallOfFame } from "@/components/HallOfFame";
import { LiveAudio } from "@/components/LiveAudio";
import { ShareCard } from "@/components/ShareCard";
import { LiveViewerBadge } from "@/components/LiveViewerBadge";
import { LegalModal } from "@/components/LegalModal";
import { Crown, Flame } from "lucide-react";

export default function HomePage() {
  const [state, setState] = useState<PublicAppState | null>(null);
  const [isTakeoverOpen, setIsTakeoverOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<"TOS" | "DISCLAIMER" | "DMCA" | "PRIVACY">("TOS");
  const [showStorageBanner, setShowStorageBanner] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const lastStateHashRef = useRef<string>("");

  useEffect(() => {
    if (!localStorage.getItem('kots_storage_ok')) {
      setShowStorageBanner(true);
    }
  }, []);

  // Poll state every 2.5s for instant sync
  const fetchState = async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (res.ok) {
        const data: PublicAppState = await res.json();
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

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs mt-4 sm:mt-0">
            {/* Isolated Live Indicator */}
            <LiveViewerBadge />

            {/* Quick Action Button */}
            <button
              onClick={() => setIsTakeoverOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-4 h-12 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-colors"
            >
              <Flame className="w-4 h-4 fill-black" />
              <span>{state.capabilities.paidTakeoverEnabled ? "CLAIM THRONE" : "TAKEOVERS PAUSED"}</span>
            </button>
            
          </div>
        </header>


        {/* 👑 OFFICIAL $KOTS TOKEN BANNER WITH CA & TRADE LINKS */}
        <TokenBanner tokenConfig={state.tokenConfig} />

        {/* PROMINENT CONCEPT EXPLAINER HERO (INSTANT UNDERSTANDING) */}
        <ConceptHero
          onOpenTakeover={() => setIsTakeoverOpen(true)}
          nextMinPriceUsd={state.nextMinPriceUsd}
        />

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

        {/* COMPREHENSIVE LEGAL & COMPLIANCE FOOTER */}
        <footer className="border-t border-cyber-border/80 pt-8 pb-12 text-xs text-gray-500 font-mono">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300 font-bold">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>KING OF THE SCREEN (2026)</span>
              </div>
              <p className="text-[11px] text-gray-500">
                A high-velocity decentralized digital art monument & social experiment.
              </p>
              <p className="text-[11px] text-gray-500">
                Official Contact:{" "}
                <a
                  href="mailto:kingofthescreen.official@gmail.com"
                  className="text-gray-400 hover:text-yellow-400 underline"
                >
                  kingofthescreen.official@gmail.com
                </a>
              </p>
            </div>

            {/* Legal Documents Quick-Switch Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
              <button
                onClick={() => openLegal("TOS")}
                className="hover:text-yellow-400 transition-colors underline"
              >
                Terms of Service
              </button>
              <span className="text-gray-700">•</span>
              <button
                onClick={() => openLegal("DISCLAIMER")}
                className="hover:text-yellow-400 transition-colors underline"
              >
                Platform Disclaimer
              </button>
              <span className="text-gray-700">•</span>
              <button
                onClick={() => openLegal("DMCA")}
                className="hover:text-yellow-400 transition-colors underline"
              >
                DMCA & Content Takedown
              </button>
              <span className="text-gray-700">•</span>
              <button
                onClick={() => openLegal("PRIVACY")}
                className="hover:text-yellow-400 transition-colors underline"
              >
                Privacy Policy
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cyber-border/40 text-[10px] text-gray-600 text-center leading-relaxed">
            Disclaimer: King of the Screen is an entertainment and advertising broadcast platform. Takeovers, token programs, and NFT programs are currently paused. Content is user-submitted and subject to moderation.
          </div>
        </footer>
      </div>

      {/* The Takeover Modal */}
      <TakeoverModal
        isOpen={isTakeoverOpen}
        onClose={() => setIsTakeoverOpen(false)}
        nextMinPriceUsd={state.nextMinPriceUsd}
        walletConfig={state.walletConfig}
        paymentsEnabled={state.capabilities.paidTakeoverEnabled}
        onSuccess={(updatedState) => {
          setState({ ...updatedState, capabilities: state.capabilities });
        }}
      />

      {/* Interactive Safe Harbor Legal Modal */}
      <LegalModal
        isOpen={isLegalOpen}
        defaultTab={legalTab}
        onClose={() => setIsLegalOpen(false)}
      />

      {/* LocalStorage Consent Banner (ePrivacy) */}
      {showStorageBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-gray-800 px-4 py-3 flex items-center justify-between gap-4 z-50 backdrop-blur-sm">
          <p className="text-[11px] text-gray-400 font-mono">
            🍪 This site uses essential browser storage and limited operational telemetry. See the Privacy Policy for details.
          </p>
          <button
            onClick={() => { localStorage.setItem('kots_storage_ok', '1'); setShowStorageBanner(false); }}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors"
          >
            OK
          </button>
        </div>
      )}
    </main>
  );
}
