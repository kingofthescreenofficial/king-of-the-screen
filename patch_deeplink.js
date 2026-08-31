const fs = require('fs');

const file = 'web/components/TakeoverModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure Smartphone icon is imported from lucide-react
if (!content.includes('Smartphone')) {
    content = content.replace('ArrowRight,', 'ArrowRight,\n  Smartphone,');
}

// Create the deep link UI component
const deepLinkUI = `
                  <div className="flex justify-center mb-4">
                     <WalletMultiButton style={{ backgroundColor: "#8b5cf6", width: "100%", justifyContent: "center", borderRadius: "12px", height: "48px" }} />
                  </div>

                  {typeof window !== 'undefined' && !(window as any).solana?.isPhantom && (
                     <div className="mb-4">
                       <a 
                         href="https://phantom.app/ul/browse/https%3A%2F%2Fkingofthescreen.fun"
                         className="w-full bg-[#ab9ff2] hover:bg-[#8b5cf6] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                       >
                         <Smartphone className="w-4 h-4" />
                         <span>📱 ON MOBILE? OPEN IN PHANTOM APP</span>
                       </a>
                     </div>
                  )}
`;

// Replace the old WalletMultiButton block
const oldMultiButton = `                  <div className="flex justify-center mb-4">
                     <WalletMultiButton style={{ backgroundColor: "#8b5cf6", width: "100%", justifyContent: "center", borderRadius: "12px", height: "48px" }} />
                  </div>`;

content = content.replace(oldMultiButton, deepLinkUI);

fs.writeFileSync(file, content);
console.log("Patched deeplink");
