"use client";

import React, { useState, useEffect } from "react";
import { AppState } from "@/lib/types";
import { ShieldAlert, RefreshCw, Trash2, CheckCircle2, Lock, ArrowLeft, Eye, KeyRound } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load saved secret from local browser storage on owner's device
  useEffect(() => {
    const saved = localStorage.getItem("kots_admin_secret");
    if (saved) setSecret(saved);
  }, []);

  const fetchState = async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (e) {
      console.warn("Failed to fetch state:", e);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleSecretChange = (val: string) => {
    setSecret(val);
    localStorage.setItem("kots_admin_secret", val);
  };

  const handleTakedown = async () => {
    if (!secret.trim()) {
      setError("Please enter your secret admin password first.");
      return;
    }

    if (!confirm("Are you sure you want to execute an EMERGENCY TAKEDOWN and reset the screen?")) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/takedown?secret=${encodeURIComponent(secret.trim())}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to execute takedown. Invalid secret password.");
      } else {
        setMessage("✓ Emergency takedown executed successfully! The screen has been reset to Genesis.");
        setState(data.state);
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08080c] text-white p-4 sm:p-8 font-mono">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-black text-red-400">
              EMERGENCY ADMIN DASHBOARD
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-lg border border-cyber-border transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Live Site</span>
          </Link>
        </div>

        {/* Private Password / Secret Key Box */}
        <div className="p-4 bg-black/60 border border-cyber-border rounded-xl space-y-2 text-xs">
          <label className="block text-gray-300 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-yellow-400" />
              <span>Admin Secret Password:</span>
            </span>
            <span className="text-[10px] text-gray-500">Only you know this password</span>
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => handleSecretChange(e.target.value)}
            placeholder="Enter your private admin password..."
            className="w-full bg-black/90 border border-cyber-border rounded-lg px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-red-500 text-sm"
          />
        </div>

        {/* Feedback Notices */}
        {message && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/80 border border-red-500 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Current Live King Status Card */}
        {state && (
          <div className="p-5 bg-cyber-card border border-cyber-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>CURRENTLY DISPLAYED ON GLOBAL SCREEN</span>
              </span>
              <span className="text-xs font-bold text-yellow-400">
                ${state.currentKing.paidAmountUsd.toFixed(2)} USD
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start bg-black/60 p-3 rounded-xl border border-cyber-border/60">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-cyber-border bg-black flex-shrink-0">
                <img
                  src={state.currentKing.mediaUrl}
                  alt="King preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-xs">
                <div className="font-bold text-white text-sm">
                  {state.currentKing.nickname}
                </div>
                <div className="text-gray-300 italic">
                  "{state.currentKing.tagline}"
                </div>
                {state.currentKing.link && (
                  <div className="text-blue-400 truncate text-[11px]">
                    🔗 {state.currentKing.link}
                  </div>
                )}
                <div className="text-gray-500 text-[10px] pt-1">
                  ID: {state.currentKing.id}
                </div>
              </div>
            </div>

            {/* BIG RED TAKEDOWN ACTION */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTakedown}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black py-4 rounded-xl shadow-[0_0_25px_rgba(225,29,72,0.6)] text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>PURGING SCREEN...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>🚨 1-CLICK PURGE & RESET SCREEN TO GENESIS</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-gray-500 text-center mt-2">
                Requires the correct private admin password. Unauthorized requests are blocked with HTTP 401.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
