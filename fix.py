with open("web/components/TakeoverModal.tsx", "r") as f:
    code = f.read()

bad1 = """<div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-xs text-gray-300 font-bold">
                      SCREEN IMAGE / GIF <span className="text-red-400">*</span>
                    </label>
                    </div>

                  
                  {/* Local File Upload with Auto-Optimization */}
                  <div"""

good1 = """<div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-xs text-gray-300 font-bold">
                      SCREEN IMAGE / GIF <span className="text-red-400">*</span>
                    </label>
                  </div>

                  {/* Local File Upload with Auto-Optimization */}
                  <div"""

code = code.replace(bad1, good1)

bad2 = """                      )}
                  </div>
                
                {/* SOLANA 1-CLICK & MANUAL PAYMENT SELECTOR */}"""

good2 = """                      )}
                  </div>
                </div>
                
                {/* SOLANA 1-CLICK & MANUAL PAYMENT SELECTOR */}"""

code = code.replace(bad2, good2)

with open("web/components/TakeoverModal.tsx", "w") as f:
    f.write(code)
