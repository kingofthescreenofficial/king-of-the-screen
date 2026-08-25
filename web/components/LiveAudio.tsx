"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Radio } from "lucide-react";

interface LiveAudioProps {
  lastEventId: string | null;
  newKingName?: string;
  newKingAmount?: number;
}

export const LiveAudio: React.FC<LiveAudioProps> = ({ lastEventId, newKingName, newKingAmount }) => {
  const [muted, setMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const prevEventRef = useRef<string | null>(lastEventId);

  // Initialize Web Audio context on user interaction
  const playSoundEffect = (type: "siren" | "cash" | "horn") => {
    if (muted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === "cash") {
        // High pitched pleasant coin / cash bell sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
        osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (type === "horn" || type === "siren") {
        // Dramatic synth brass fanfare
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sawtooth";
        osc2.type = "square";

        osc1.frequency.setValueAtTime(220, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.2);
        osc1.frequency.setValueAtTime(554.37, ctx.currentTime + 0.4);

        osc2.frequency.setValueAtTime(222, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(444, ctx.currentTime + 0.2);
        osc2.frequency.setValueAtTime(556, ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.2);
        osc2.stop(ctx.currentTime + 1.2);
      }
    } catch (e) {
      console.warn("Web audio playback error:", e);
    }
  };

  // Text-to-speech announcement
  const speakAnnouncement = (name: string, amount: number) => {
    if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Alert! ${name} has claimed the throne for ${amount} dollars!`
      );
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  };

  // Trigger when a new King event is detected
  useEffect(() => {
    if (lastEventId && lastEventId !== prevEventRef.current) {
      prevEventRef.current = lastEventId;
      if (audioReady && !muted) {
        playSoundEffect("siren");
        setTimeout(() => playSoundEffect("cash"), 300);
        if (newKingName && newKingAmount) {
          setTimeout(() => speakAnnouncement(newKingName, newKingAmount), 600);
        }
      }
    }
  }, [lastEventId, audioReady, muted, newKingName, newKingAmount]);

  const toggleSound = () => {
    setAudioReady(true);
    setMuted(!muted);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-cyber-card/90 backdrop-blur-md border border-cyber-border px-3 py-1.5 rounded-full shadow-lg">
      <div className="flex items-center gap-1.5 text-xs text-cyber-neon font-mono">
        <Radio className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">LIVE AUDIO FX</span>
      </div>
      <button
        onClick={toggleSound}
        className={`p-1.5 rounded-full transition-all ${
          muted
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        }`}
        title={muted ? "Unmute Sound & TTS" : "Mute Sound & TTS"}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
