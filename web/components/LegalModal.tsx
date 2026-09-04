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

        <div className="text-[10px] text-gray-600 mb-3 font-mono">Last Updated: September 4, 2026</div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-gray-300 leading-relaxed">
          {activeTab === "TOS" && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-400" />
                1. Nature of Service & Age Restriction
              </h3>
              <p>
                <strong>King of the Screen</strong> operates strictly as an interactive digital art experiment and a real-time digital advertising billboard. 
                By using this site, you warrant that you are at least <strong>18 years of age</strong> (or the age of majority in your jurisdiction).
              </p>
              <p>
                Takeovers are currently paused. Any future payment terms, including cancellation and refund rules, will be published before payments are enabled.
              </p>

              <h3 className="text-base font-bold text-white pt-2">2. Section 230 CDA & User Content Liability</h3>
              <p>
                The platform operates as an "Interactive Computer Service" under Section 230 of the Communications Decency Act. We are not the publisher or speaker of any user-submitted content. 
                You agree to <strong>fully indemnify and hold harmless</strong> the platform from any third-party claims arising from your uploads.
              </p>

              <h3 className="text-base font-bold text-white pt-2">3. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, the platform operators shall not be liable for any indirect, incidental, or consequential damages. 
                Our total cumulative liability to you for any claim arising out of your use of the site shall not exceed <strong>the amount you paid to the platform, or $50 USD, whichever is less</strong>.
              </p>

              <h3 className="text-base font-bold text-white pt-2">4. Binding Arbitration & Class Action Waiver</h3>
              <p>
                Any dispute, claim, or controversy arising out of your use of this platform shall be resolved exclusively by <strong>individual, binding arbitration</strong>. 
                You explicitly waive your right to a trial by jury or to participate in any <strong>class action, collective action, or representative proceeding</strong>.
              </p>

              <h3 className="text-base font-bold text-white pt-2">5. Disclaimer of Warranties ("AS IS")</h3>
              <p>
                THE PLATFORM IS PROVIDED <strong>"AS IS" AND "AS AVAILABLE"</strong> WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. 
                We do not guarantee uninterrupted access, error-free operation, or the security of blockchain transactions.
              </p>

              <h3 className="text-base font-bold text-white pt-2">6. Force Majeure</h3>
              <p>
                The platform shall not be liable for delays or failures caused by blockchain network congestion, smart contract errors, Solana validator outages, third-party service disruptions, natural disasters, government actions, or other events beyond our reasonable control.
              </p>

              <h3 className="text-base font-bold text-white pt-2">7. OFAC Sanctions Compliance</h3>
              <p>
                By using this platform, you represent and warrant that you are <strong>not located in, under the control of, or a national or resident of</strong> any country or territory subject to United States sanctions administered by OFAC (including, without limitation, Iran, North Korea, Cuba, Syria, and the Crimea, Donetsk, and Luhansk regions of Ukraine).
              </p>

              <h3 className="text-base font-bold text-white pt-2">8. Intellectual Property</h3>
              <p>
                All trademarks, logos, service marks (including "King of the Screen", the crown logo, and "$KOTS"), and all site content not submitted by users are the exclusive property of the platform operators. Unauthorized use is prohibited.
              </p>

              <h3 className="text-base font-bold text-white pt-2">9. Severability</h3>
              <p>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such invalidity shall not affect the remaining provisions, which shall remain in <strong>full force and effect</strong>.
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

              <h3 className="text-base font-bold text-white pt-2">2. Token and NFT programs</h3>
              <p>
                The proposed KOTS v1.2 program is not live. A new KOTS mint has not been created. The existing Pump.fun token is not an official KOTS v1.2 asset and is not used by this platform.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 text-sm mt-1">
                <li>Payments, NFT minting, KOTS claims, and KOTS trading operations are disabled.</li>
                <li>Final eligibility, claim, vesting, and jurisdiction rules will be published before any live program.</li>
                <li>Digital assets can be volatile and may lose all value.</li>
              </ul>

              <h3 className="text-base font-bold text-white pt-2">3. The $1,000,000 Progress Tracker</h3>
              <p>
                The "$1,000,000 Goal" displayed on the platform is an <strong>artistic social benchmark</strong> and fundraising counter. It is NOT a lottery jackpot, prize pool, or fund to be distributed to participants.
              </p>

              <h3 className="text-base font-bold text-white pt-2">4. Cryptocurrency Volatility</h3>
              <p>
                Payments are denominated in USD but settled in cryptocurrency (SOL). The value of SOL and $KOTS tokens may <strong>fluctuate dramatically</strong>. 
                You acknowledge that the platform has no control over cryptocurrency market prices, and that the USD equivalent of your payment may differ at the time of blockchain confirmation.
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
                1. Data We Collect
              </h3>
              <p>
                We do not collect names, emails, phone numbers, or government-issued IDs. The following data is recorded when you use the platform:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 text-sm">
                <li><strong>Public wallet address</strong> (provided by your wallet extension)</li>
                <li><strong>Blockchain transaction hash</strong> (txHash, publicly visible on-chain)</li>
                <li><strong>User-submitted content</strong> (nickname, message, image URL, external link)</li>
                <li><strong>IP address</strong> (transiently processed by our web server; not stored in application logs)</li>
              </ul>

              <h3 className="text-base font-bold text-white pt-2">2. How Data Is Stored</h3>
              <p>
                Application state (current king, hall of fame, transaction history) is stored on a virtual private server. Uploaded images are stored temporarily for display purposes. 
                We do not operate a persistent user database and do not create user accounts or profiles.
              </p>

              <h3 className="text-base font-bold text-white pt-2">3. Cookies & Local Storage</h3>
              <p>
                This site uses essential browser storage and limited operational telemetry, such as page views and session activity. We do not use advertising SDKs or tracking pixels.
              </p>

              <h3 className="text-base font-bold text-white pt-2">4. Third-Party Data Sharing</h3>
              <p>
                Your data may be shared with the following third-party services strictly for operational purposes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 text-sm">
                <li><strong>Solana RPC Provider</strong> (Ankr) — receives your wallet address and transaction data to process blockchain operations.</li>
                <li><strong>Sightengine</strong> — receives image URLs for automated content moderation (NSFW, hate symbol detection).</li>
                <li><strong>CoinGecko API</strong> — receives anonymized price queries (no personal data transmitted).</li>
              </ul>

              <h3 className="text-base font-bold text-white pt-2">5. Your Rights (GDPR / CCPA)</h3>
              <p>
                If you are a resident of the EU/EEA or California, you have the right to request access to, correction of, or deletion of your personal data. 
                To exercise these rights, contact us at{" "}
                <a href="mailto:kingofthescreen.official@gmail.com" className="text-yellow-400 underline font-bold">
                  kingofthescreen.official@gmail.com
                </a>.{" "}
                Please note that data recorded on the Solana blockchain is immutable and cannot be deleted by us.
              </p>

              <h3 className="text-base font-bold text-white pt-2">6. Data Retention</h3>
              <p>
                Off-chain application data (nicknames, images, display history) is retained for the operational lifetime of the platform. 
                On-chain data (transaction hashes, wallet addresses) is permanently recorded on the Solana blockchain and is beyond our ability to modify or delete.
              </p>
            </div>
          )}
        </div>

        {/* Footer Confirmation */}
        <div className="mt-6 pt-4 border-t border-cyber-border/80 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">To the extent permitted by applicable law, governed by the laws of the Republic of Panama</span>
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
