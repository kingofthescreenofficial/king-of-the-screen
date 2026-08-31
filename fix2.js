const fs = require('fs');
let code = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');

// I need to find the exact block and replace it
const blockToReplace = \`<div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-xs text-gray-300 font-bold">
                      SCREEN IMAGE / GIF <span className="text-red-400">*</span>
                    </label>
                    </div>

                  
                  {/* Local File Upload with Auto-Optimization */}
                  <div\`;

const goodBlock = \`<div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-xs text-gray-300 font-bold">
                      SCREEN IMAGE / GIF <span className="text-red-400">*</span>
                    </label>
                  </div>

                  {/* Local File Upload with Auto-Optimization */}
                  <div\`;

code = code.replace(blockToReplace, goodBlock);

// Also need to close the 'space-y-2' div at the end of the upload section!
// Let's find where the upload section ends
const uploadEndBlock = \`                      )}
                  </div>
                
                {/* SOLANA 1-CLICK & MANUAL PAYMENT SELECTOR */}
\`;

const uploadEndGood = \`                      )}
                  </div>
                </div>
                
                {/* SOLANA 1-CLICK & MANUAL PAYMENT SELECTOR */}
\`;

code = code.replace(uploadEndBlock, uploadEndGood);
fs.writeFileSync('web/components/TakeoverModal.tsx', code);
