const fs = require('fs');
let code = fs.readFileSync('web/components/LegalModal.tsx', 'utf8');

// Replace the DISCLAIMER section
const oldDisclaimer = `          {activeTab === "DISCLAIMER" && (
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
          )}`;

const newDisclaimer = `          {activeTab === "DISCLAIMER" && (
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

              <h3 className="text-base font-bold text-white pt-2">2. Token Airdrops ($KOTS) & NFTs</h3>
              <p>
                Any digital tokens ($KOTS) or NFTs distributed by this platform are provided strictly as a <strong>free, novelty artistic gift</strong> to users who purchase billboard space. 
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 text-sm mt-1">
                <li>Tokens are meme-coins created purely for entertainment purposes.</li>
                <li>They hold <strong>no intrinsic value</strong>, represent no stake or ownership in the platform, and have no guaranteed price floor.</li>
                <li>You acknowledge you are paying for advertising space, <strong>not</strong> purchasing $KOTS tokens.</li>
                <li>The platform is not responsible for secondary market volatility or token liquidity.</li>
              </ul>

              <h3 className="text-base font-bold text-white pt-2">3. The $1,000,000 Progress Tracker</h3>
              <p>
                The "$1,000,000 Goal" displayed on the platform is an <strong>artistic social benchmark</strong> and fundraising counter. It is NOT a lottery jackpot, prize pool, or fund to be distributed to participants.
              </p>
            </div>
          )}`;

if (code.includes('The "$1,000,000 Goal" displayed on the platform')) {
    code = code.replace(oldDisclaimer, newDisclaimer);
    fs.writeFileSync('web/components/LegalModal.tsx', code);
    console.log("Patched Legal Disclaimer!");
} else {
    console.log("Could not find the block");
}
