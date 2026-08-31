const fs = require('fs');
let code = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');

const oldBlock = `                      {isUploading ? (
                        <div className="flex items-center gap-2 text-yellow-400 text-xs py-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Optimizing photo for instant broadcast...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-yellow-400/80" />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Tap to select photo / GIF from device
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Auto-optimized for instant full HD display
                            </span>
                          </div>
                        </>
                      )}`;

const newBlock = `                      {isUploading ? (
                        <div className="flex items-center gap-2 text-yellow-400 text-xs py-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Optimizing photo for instant broadcast...</span>
                        </div>
                      ) : mediaUrl ? (
                         <div className="w-full flex items-center justify-between px-2 py-1">
                           <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0">
                               <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                             </div>
                             <div className="text-left">
                               <span className="text-sm font-bold text-yellow-400 block">Image attached!</span>
                               <span className="text-[10px] text-gray-400 block">Tap to change</span>
                             </div>
                           </div>
                         </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-yellow-400/80" />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Tap to select photo / GIF from device
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Auto-optimized for instant full HD display
                            </span>
                          </div>
                        </>
                      )}`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('web/components/TakeoverModal.tsx', code);
console.log("Patched preview!");
