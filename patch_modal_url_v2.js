const fs = require('fs');
let code = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');

// Inject state if not present
if (!code.includes('showUrlInput')) {
    code = code.replace(
        'const [isUploading, setIsUploading] = useState(false);',
        'const [isUploading, setIsUploading] = useState(false);\n  const [showUrlInput, setShowUrlInput] = useState(false);'
    );
}

const dropzoneStart = `                  {/* Local File Upload with Auto-Optimization */}
                  <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}`;

const newDropzoneStart = `                  {showUrlInput ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://example.com/image.png"
                        className="w-full bg-[#0a0a0f] border-2 border-gray-800 focus:border-yellow-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-700 outline-none transition-colors"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowUrlInput(false)}
                        className="text-xs text-yellow-500 hover:text-yellow-400 font-bold uppercase tracking-wider"
                      >
                        ← Back to Gallery Upload
                      </button>
                    </div>
                  ) : (
                  <>
                  {/* Local File Upload with Auto-Optimization */}
                  <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}`;

if (code.includes(dropzoneStart) && !code.includes('showUrlInput ?')) {
   code = code.replace(dropzoneStart, newDropzoneStart);
}

const dropzoneEnd = `                      )}
                  </div>
                </div>

                {/* Error Message Placed Directly Above Submit Button */}`;

const newDropzoneEnd = `                      )}
                  </div>
                  <div className="text-right mt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowUrlInput(true)}
                      className="text-[10px] text-gray-500 hover:text-gray-400 font-bold uppercase tracking-wider"
                    >
                      Having trouble? Paste image URL
                    </button>
                  </div>
                  </>
                  )}
                </div>

                {/* Error Message Placed Directly Above Submit Button */}`;

if (code.includes(dropzoneEnd)) {
   code = code.replace(dropzoneEnd, newDropzoneEnd);
}

fs.writeFileSync('web/components/TakeoverModal.tsx', code);
console.log("Patched URL fallback!");
