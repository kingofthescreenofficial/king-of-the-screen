const fs = require('fs');
const file = 'web/components/TakeoverModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// The problematic block is around line 426
const badBlock = \`<label className="text-xs text-gray-300 font-bold">
                      SCREEN IMAGE / GIF <span className="text-red-400">*</span>
                    </label>
                    </div>\`;

const goodBlock = \`<label className="text-xs text-gray-300 font-bold">
                      SCREEN IMAGE / GIF <span className="text-red-400">*</span>
                    </label>
                  </div>\`;

content = content.replace(badBlock, goodBlock);

// Wait, the parent 'div className="space-y-2"' needs to be closed?
// The actual structure was:
// <div className="space-y-2">
//   <div className="flex flex-wrap ...">
//      <label>...</label>
//      <div className="flex items-center gap-1 text-[11px]"> ...tabs... </div>
//   </div>
//   ...tabs content...
// </div>

// In my patch I replaced the tabs block with `</div>`
// Let's just fix the whole structure manually
