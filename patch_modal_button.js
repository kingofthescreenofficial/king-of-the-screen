const fs = require('fs');
let code = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');

const oldBlock = `                {!publicKey ? (
                   <div className="p-4 bg-purple-900/20 border-2 border-purple-500/50 rounded-xl text-center">
                     <p className="text-purple-300 font-bold mb-2">Wallet Not Connected</p>
                     <p className="text-xs text-gray-400">Please connect your Phantom wallet in the top right corner to claim the throne.</p>
                   </div>
                ) : (`;

const newBlock = `                {!publicKey ? (
                   <div className="w-full flex justify-center mt-2">
                     <WalletMultiButton style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "56px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", justifyContent: "center", textTransform: "uppercase" }}>
                       CONNECT WALLET TO CONTINUE
                     </WalletMultiButton>
                   </div>
                ) : (`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('web/components/TakeoverModal.tsx', code);
console.log("Patched modal button");
