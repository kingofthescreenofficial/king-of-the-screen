with open("web/app/page.tsx", "r") as f:
    code = f.read()

bad_block = """        {/* Global Wallet Connect (Web3 Standard) */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-2 -mt-4 mb-4">
           <div className="flex justify-end items-center -mt-4 mb-4">
           <div className="w-full sm:w-auto flex justify-center sm:justify-end wallet-button-large">
              <WalletMultiButton style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "48px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", justifyContent: "center" }} />
           </div>
        </div>"""

good_block = """        {/* Global Wallet Connect (Web3 Standard) */}
        <div className="flex justify-end items-center -mt-4 mb-4">
           <div className="w-full sm:w-auto flex justify-center sm:justify-end wallet-button-large">
              <WalletMultiButton style={{ backgroundColor: "#8b5cf6", border: "2px solid #a855f7", height: "48px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", width: "100%", justifyContent: "center" }} />
           </div>
        </div>"""

code = code.replace(bad_block, good_block)

with open("web/app/page.tsx", "w") as f:
    f.write(code)
