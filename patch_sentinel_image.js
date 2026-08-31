const fs = require('fs');
const file = 'airdrop_sentinel.js';
let content = fs.readFileSync(file, 'utf8');

const newBufferLogic = `async function getBufferFromDataUri(dataUri) {
  const matches = dataUri.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout
        const response = await fetch(dataUri, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        // Strict size check for remote images (max 2MB)
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 2 * 1024 * 1024) {
             throw new Error("Image too large");
        }
        
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 2 * 1024 * 1024) throw new Error("Image too large");
        
        return { buffer: Buffer.from(arrayBuffer), contentType: response.headers.get('content-type') || 'image/jpeg' };
    } catch(e) {
        console.error("Failed to fetch remote image:", e.message);
        return null; // fallback
    }
  }
  
  const buffer = Buffer.from(matches[2], 'base64');
  if (buffer.length > 2 * 1024 * 1024) return null;
  return { buffer, contentType: matches[1] };
}`;

const oldBufferRegex = /async function getBufferFromDataUri[\s\S]*?return { buffer: Buffer\.from\(matches\[2\], 'base64'\), contentType: matches\[1\] };\n}/;
content = content.replace(oldBufferRegex, newBufferLogic);

fs.writeFileSync(file, content);
console.log("Patched sentinel");
