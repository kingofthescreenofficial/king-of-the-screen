"use client";

import { ShieldAlert, X } from "lucide-react";

import { AppState } from "@/lib/types";

interface TakeoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextMinPriceUsd: number;
  walletConfig: AppState["walletConfig"];
  onSuccess: (updatedState: AppState) => void;
  paymentsEnabled: boolean;
}

export function TakeoverModal({ isOpen, onClose, paymentsEnabled }: TakeoverModalProps) {
  if (!isOpen) return null;

  return (
    <div
      aria-labelledby="takeover-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-3 sm:p-4"
      role="dialog"
    >
      <div className="min-h-full flex items-start sm:items-center justify-center py-6 sm:py-10">
        <section className="relative w-full max-w-lg bg-[#111119] border-2 border-yellow-500/70 rounded-2xl shadow-2xl p-6 sm:p-8 text-white font-mono text-center">
          <button
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2.5 text-gray-400 hover:text-white bg-black/70 hover:bg-black rounded-full transition-colors"
            onClick={onClose}
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
          <ShieldAlert className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-black text-yellow-400" id="takeover-modal-title">
            {paymentsEnabled ? "TAKEOVERS ARE UNAVAILABLE" : "PAID TAKEOVERS ARE PAUSED"}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed mt-4">
            {paymentsEnabled
              ? "This release does not enable transactions."
              : "No wallet transaction will be requested or sent while payments are paused."}
          </p>
          <button
            className="w-full mt-6 bg-cyber-card border border-cyber-border hover:border-yellow-500 py-3 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-colors"
            onClick={onClose}
            type="button"
          >
            RETURN TO LIVE SCREEN
          </button>
        </section>
      </div>
    </div>
  );
}
