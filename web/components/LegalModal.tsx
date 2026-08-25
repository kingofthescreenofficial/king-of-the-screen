"use client";

import React, { useState } from "react";
import { X, ShieldCheck, FileText, AlertTriangle, Scale, Lock } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "TOS" | "DISCLAIMER" | "DMCA" | "PRIVACY";
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "TOS",
}) => {
  const [activeTab, setActiveTab] = useState<"TOS" | "DISCLAIMER" | "DMCA" | "PRIVACY">(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#111119] border border-cyber-border rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-gray-300 font-mono text-xs sm:text-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-black/60 hover:bg-black/90 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 text-yellow-400 font-bold text-lg sm:text-xl border-b border-cyber-border/80 pb-4 mb-6">
          <Scale className="w-6 h-6 text-yellow-400 flex-shrink-0" />
          <span>LEGAL COMPLIANCE & TERMS OF SERVICE</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-cyber-border/40 pb-3 text-xs">
          <button
            onClick={() => setActiveTab("TOS")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === "TOS" ? "bg-yellow-500 text-black" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab("DISCLAIMER")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === "DISCLAIMER" ? "bg-yellow-500 text-black" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            Financial Disclaimer
          </button>
          <button
            onClick={() => setActiveTab("DMCA")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === "DMCA" ? "bg-yellow-500 text-black" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            DMCA & Moderation
          </button>
          <button
            onClick={() => setActiveTab("PRIVACY")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === "PRIVACY" ? "bg-yellow-500 text-black" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-gray-300 leading-relaxed">
          {activeTab === "TOS" && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-400" />
                1. Nature of Service & Irrevocable Micropayments
              </h3>
              <p>
                <strong>King of the Screen</strong> operates strictly as an interactive digital art experiment and a real-time digital advertising billboard. 
              </p>
              <p>
                When a user initiates a transaction (in cryptocurrency or other supported methods), the user purchases <strong>immediate digital display time</strong> on the public billboard canvas. 
                Because the service (public broadcasting of the user's submitted content) is executed and delivered immediately upon transaction confirmation, <strong>all payments are strictly final, non-refundable, and non-cancellable</strong>.
              </p>

              <h3 className="text-base font-bold text-white pt-2">2. "Hold Until Outbid" Rule</h3>
              <p>
                The user acknowledges and agrees that their reign on the screen is dynamic and temporary, lasting exclusively until another challenger submits a valid higher bid. The platform makes no guarantees regarding the duration of any user's reign.
              </p>

              <h3 className="text-base font-bold text-white pt-2">3. User Warranties & Full Indemnification</h3>
              <p>
                By submitting any text, image, GIF, or link, you represent and warrant that you hold all necessary legal rights, copyrights, and permissions to broadcast such material. 
                You agree to <strong>fully defend, indemnify, and hold harmless</strong> the platform operators, founders, and infrastructure providers from any third-party claims, liabilities, losses, damages, or legal fees arising from your uploaded content.
              </p>
            </div>
          )}

          {activeTab === "DISCLAIMER" && (
            <div className="space-y-3">
              <div className="p-3.5 bg-yellow-950/40 border border-yellow-500/50 rounded-xl text-yellow-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-1">NO FINANCIAL OR INVESTMENT PRODUCT</strong>
                  This website is NOT an investment platform, security, cryptocurrency presale, yield instrument, dividend fund, lottery, or gambling service.
                </div>
              </div>

              <h3 className="text-base font-bold text-white pt-2">1. No Expectation of Profit</h3>
              <p>
                Payments made on this site are classified strictly as <strong>advertising and billboard display fees</strong>. There is no expectation of financial return, profit sharing, dividend payment, or monetary yield of any kind.
              </p>

              <h3 className="text-base font-bold text-white pt-2">2. The $1,000,000 Progress Tracker</h3>
              <p>
                The "$1,000,000 Goal" displayed on the platform is an <strong>artistic social benchmark</strong> and fundraising counter. It is NOT a lottery jackpot, prize pool, or fund to be distributed to participants.
              </p>
            </div>
          )}

          {activeTab === "DMCA" && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                1. Prohibited Content & Automated AI Filtering
              </h3>
              <p>
                The platform maintains a zero-tolerance policy against prohibited content. The following categories are strictly forbidden:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2">
                <li>Child sexual abuse material (CSAM) or non-consensual imagery.</li>
                <li>Hate speech, harassment, incitement of violence, or terror propaganda.</li>
                <li>Illicit narcotics, weapons, or illegal services.</li>
                <li>Malicious links (phishing, malware, drainers).</li>
              </ul>

              <h3 className="text-base font-bold text-white pt-2">2. Right to Remove & Blackhole</h3>
              <p>
                The platform operators reserve the unconditional right to instantly terminate, remove, or replace any broadcast content deemed in violation of these rules, with zero refund obligation to the submitter.
              </p>

              <h3 className="text-base font-bold text-white pt-2">3. DMCA & Copyright Takedown Notice</h3>
              <p>
                If you believe your copyrighted work or trademark has been improperly displayed on the billboard, contact the operator immediately at{" "}
                <a href="mailto:kingofthescreen.official@gmail.com" className="text-yellow-400 underline font-bold">
                  kingofthescreen.official@gmail.com
                </a>{" "}
                with proof of ownership for expedited takedown.
              </p>
            </div>
          )}

          {activeTab === "PRIVACY" && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                1. Zero Personal Data Tracking
              </h3>
              <p>
                We do not collect names, phone numbers, passport credentials, or private information. 
              </p>
              <p>
                Public blockchain transaction hashes (txHash) and publicly submitted aliases are recorded strictly for on-chain transparency and display history.
              </p>
            </div>
          )}
        </div>

        {/* Footer Confirmation */}
        <div className="mt-6 pt-4 border-t border-cyber-border/80 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">Governed by International Digital Advertising & Art Standards</span>
          <button
            onClick={onClose}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
