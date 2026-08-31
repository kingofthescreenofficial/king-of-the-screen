const fs = require('fs');
const file = 'web/components/TakeoverModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the Tabs UI completely
const tabsRegex = /<div className="flex items-center gap-1 text-\[11px\]">[\s\S]*?<\/div>\n\s*<\/div>/;
content = content.replace(tabsRegex, '</div>');

// 2. Remove the condition wrappers for UPLOAD (make it always visible)
content = content.replace(/\{imageSourceTab === "UPLOAD" && \(/, '');
content = content.replace(/\{\/\* TAB 1: Local File Upload with Auto-Optimization \*\/\}/, '{/* Local File Upload with Auto-Optimization */}');

// We need to carefully remove the closing `)}` for the UPLOAD tab
// Wait, it's safer to just replace the whole section via regex or string slice
const uploadStart = content.indexOf('{/* Local File Upload');
const presetsEnd = content.indexOf('{/* SOLANA 1-CLICK & MANUAL PAYMENT SELECTOR */}');

const newUI = `
                  {/* Local File Upload with Auto-Optimization */}
                  <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-cyber-border hover:border-yellow-500/80 bg-black/50 hover:bg-black/70 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        className="hidden"
                      />
                      {isUploading ? (
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
                      )}
                  </div>
`;

content = content.slice(0, uploadStart) + newUI + '\n                ' + content.slice(presetsEnd);

// 3. Change default mediaUrl state
content = content.replace('const [mediaUrl, setMediaUrl] = useState(MEME_PRESETS[0].url);', 'const [mediaUrl, setMediaUrl] = useState("");');

// 4. Remove MEME_PRESETS constant if it's there
content = content.replace(/const MEME_PRESETS = \[[\s\S]*?\];/g, '');

fs.writeFileSync(file, content);
console.log("Patched image UI");
