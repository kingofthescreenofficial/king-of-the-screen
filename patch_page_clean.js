const fs = require('fs');
let code = fs.readFileSync('web/app/page.tsx', 'utf8');

// 1. Remove the useEffect and states
const effectRegex = /const \[isPhantomBrowser[\s\S]*?\}, \[\]\);/g;
code = code.replace(effectRegex, '');

// 2. Remove the old wallet block with the deep link and replace with just a BIG Connect Wallet button
const oldWalletBlock = /\{mounted && !isPhantomBrowser[\s\S]*?<\/div>\n\s*<\/div>/;
const newWalletBlock = `<div className="flex justify-end items-center -mt-4 mb-4">
           <div className="w-full sm:w-auto flex justify-center sm:justify-end wallet-button-large">
              <WalletMultiButton style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "48px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", justifyContent: "center" }} />
           </div>
        </div>`;

code = code.replace(oldWalletBlock, newWalletBlock);

fs.writeFileSync('web/app/page.tsx', code);
console.log("Patched page.tsx for pure clean Web3");
