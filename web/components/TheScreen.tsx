"use client";

import React from "react";
import { King } from "@/lib/types";
import { ReignTimer } from "./ReignTimer";
import { Crown, ExternalLink, Flame, Globe, ArrowUpRight } from "lucide-react";

interface TheScreenProps {
  king: King;
  nextMinPriceUsd: number;
  onOpenTakeover: () => void;
}

export const TheScreen: React.FC<TheScreenProps> = React.memo(
  ({ king, nextMinPriceUsd, onOpenTakeover }) => {
    return (
      <div className="relative w-full max-w-5xl mx-auto my-4 group font-mono">
        {/* Outer Glow Frame (Static) */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-yellow-500/30 via-emerald-500/20 to-purple-600/30 blur-md opacity-75" />

        {/* Main Screen Container */}
        <div className="relative bg-[#0d0d15] border-2 border-yellow-500/70 rounded-2xl overflow-hidden shadow-2xl">
          {/* Top Ticker Header */}
          <div className="bg-black/90 px-4 py-2.5 border-b border-yellow-500/30 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-yellow-400 font-bold tracking-wider">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-glow-gold uppercase">CURRENT MONARCH OF THE INTERNET</span>
            </div>

            <div className="flex items-center gap-4 text-gray-300">
              {/* Isolated Live Reign Timer */}
              <ReignTimer crownedAt={king.crownedAt} />

              {/* Paid Amount */}
              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-emerald-400 font-bold text-sm">
                <span>${king.paidAmountUsd.toFixed(2)}</span>
                <span className="text-[11px] text-gray-400 font-normal">({king.cryptoCurrency})</span>
              </div>
            </div>
          </div>

          {/* Center Media Showcase - 100% Full Uncropped Image */}
          <div className="relative w-full min-h-[360px] sm:min-h-[480px] max-h-[620px] bg-[#050508] flex items-center justify-center overflow-hidden p-2 sm:p-4">
            {king.mediaUrl ? (
              <>
                {/* Blurred Ambient Background Backdrop */}
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-25 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${king.mediaUrl})` }}
                />

                {/* Main Full Uncropped Foreground Image (Clickable) */}
                {king.link ? (
                  <a
                    href={king.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 block cursor-pointer group/img transition-transform hover:scale-[1.01]"
                    title={`Open ${king.link}`}
                  >
                    <img
                      src={king.mediaUrl}
                      alt={king.nickname}
                      className="max-h-[340px] sm:max-h-[480px] w-auto max-w-full object-contain rounded-lg shadow-2xl group-hover/img:brightness-105"
                    />
                  </a>
                ) : (
                  <img
                    src={king.mediaUrl}
                    alt={king.nickname}
                    className="relative z-10 max-h-[340px] sm:max-h-[480px] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                  />
                )}
              </>
            ) : (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 text-center">
                <Crown className="w-20 h-20 text-yellow-400/50 mb-4" />
                <p className="text-xl text-gray-400">The throne awaits its next conqueror.</p>
              </div>
            )}
          </div>

          {/* HERO PROMINENT KING INFO & MESSAGE SECTION */}
          <div className="bg-[#11111c] border-t-2 border-yellow-500/40 p-5 sm:p-8 space-y-5">
            {/* Top Line: Sender Nickname + Crown Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyber-border/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-4xl font-black text-white tracking-wide text-glow-gold flex items-center gap-2">
                  👑 {king.nickname}
                </span>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm px-3 py-1 rounded-md uppercase tracking-wider shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                  Active Monarch
                </span>
              </div>

              {/* Price Badge */}
              <div className="text-right">
                <span className="text-xs text-gray-400 block uppercase">Throne Claimed For</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">
                  ${king.paidAmountUsd.toFixed(2)}
                </span>
              </div>
            </div>

            {/* MAIN MESSAGE (HUGE & DOMINANT) */}
            <div className="py-1">
              <p className="text-2xl sm:text-4xl font-black text-emerald-300 leading-tight tracking-tight drop-shadow-[0_2px_15px_rgba(110,231,183,0.3)]">
                "{king.tagline}"
              </p>
            </div>

            {/* ULTRA-EXPRESSIVE TARGET LINK BANNER (IF PRESENT) */}
            {king.link && (
              <a
                href={king.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-[#032b36] via-[#051d24] to-[#032b36] hover:from-[#053d4c] hover:to-[#053d4c] border-2 border-cyan-400 hover:border-cyan-300 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-3 bg-cyan-400 text-black font-black rounded-xl group-hover/link:scale-110 transition-transform flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-black text-cyan-300 uppercase tracking-widest block">
                      🔗 OFFICIAL PROMOTED LINK / WEBSITE
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-white group-hover/link:text-cyan-200 truncate block">
                      {king.link.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.7)] transition-colors">
                  <span>VISIT WEBSITE</span>
                  <ArrowUpRight className="w-5 h-5 stroke-[3]" />
                </div>
              </a>
            )}

            {/* Quick Dethrone CTA Button */}
            <div className="pt-2">
              <button
                onClick={onOpenTakeover}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black py-4 sm:py-5 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.7)] active:scale-[0.99] transition-transform text-lg sm:text-xl uppercase tracking-wider"
              >
                <Flame className="w-7 h-7 fill-red-600 text-red-600" />
                <span>DETHRONE CURRENT KING FOR ${nextMinPriceUsd.toFixed(2)}</span>
              </button>
            </div>
          </div>

          {/* Live Broadcast Watermark Bar */}
          <div className="bg-black/95 px-4 py-2 border-t border-cyber-border flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-red-400 font-bold">24/7 GLOBAL LIVE FEED</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span>TX: <span className="text-gray-300">{king.txHash || "on-chain verified"}</span></span>
              <span>RULE: <span className="text-yellow-400">Holds screen until outbid</span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TheScreen.displayName = "TheScreen";
