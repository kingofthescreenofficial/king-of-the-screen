const fs = require('fs');
let code = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');

// 1. Inject the state
if (!code.includes('showUrlInput')) {
    code = code.replace(
        'const [isUploading, setIsUploading] = useState(false);',
        'const [isUploading, setIsUploading] = useState(false);\n  const [showUrlInput, setShowUrlInput] = useState(false);'
    );
}

// 2. Locate the media upload block and replace it
const oldBlock = `<label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    THE SCREEN (IMAGE)
                  </label>
                  <div
                    className={\`relative w-full h-40 sm:h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden \${
                      mediaUrl ? "border-yellow-500 bg-yellow-500/10" : "border-gray-600 hover:border-gray-500 bg-gray-900"
                    }\`}`;

const newBlock = `<label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    THE SCREEN (IMAGE)
                  </label>
                  
                  {showUrlInput ? (
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
                  <div
                    className={\`relative w-full h-40 sm:h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden \${
                      mediaUrl ? "border-yellow-500 bg-yellow-500/10" : "border-gray-600 hover:border-gray-500 bg-[#0a0a0f]"
                    }\`}`;

if (code.includes(oldBlock)) {
    code = code.replace(oldBlock, newBlock);
}

// 3. Add the "Having trouble" button right after the dropzone closes
const closingBlock = `                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>`;

const newClosingBlock = `                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="text-right">
                    <button 
                      type="button" 
                      onClick={() => setShowUrlInput(true)}
                      className="text-[10px] text-gray-500 hover:text-gray-400 font-bold uppercase tracking-wider pt-1"
                    >
                      Having trouble? Paste image URL
                    </button>
                  </div>
                  </>
                  )}`;

if (code.includes(closingBlock)) {
    code = code.replace(closingBlock, newClosingBlock);
}

fs.writeFileSync('web/components/TakeoverModal.tsx', code);
console.log("Patched URL fallback for image upload!");
