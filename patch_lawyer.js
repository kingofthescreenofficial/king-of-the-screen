const fs = require('fs');
let code = fs.readFileSync('web/components/LegalModal.tsx', 'utf8');

const oldTos = `{activeTab === "TOS" && (
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
          )}`;

const newTos = `{activeTab === "TOS" && (
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
                Because the service is executed immediately upon transaction confirmation, <strong>all payments are strictly final, non-refundable, and non-cancellable</strong>.
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
            </div>
          )}`;

const oldFooter = `<span className="text-[11px] text-gray-500">Governed by International Digital Advertising & Art Standards</span>`;
const newFooter = `<span className="text-[11px] text-gray-500">Governed by the laws of Panama (Subject to Binding Arbitration)</span>`;

if (code.includes('Nature of Service & Irrevocable Micropayments')) {
    code = code.replace(oldTos, newTos);
    code = code.replace(oldFooter, newFooter);
    fs.writeFileSync('web/components/LegalModal.tsx', code);
    console.log("Patched Lawyer rules!");
} else {
    console.log("Could not find the TOS block");
}
