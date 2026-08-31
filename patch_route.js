const fs = require('fs');

const file = 'web/app/api/takeover/route.ts';
let content = fs.readFileSync(file, 'utf8');

const sizeCheck = `
    // 2. Strict On-Chain Transaction Verification with Auto-Sanitization
    if (mediaUrl && mediaUrl.startsWith("data:") && mediaUrl.length > 500 * 1024) {
      return NextResponse.json({ error: "Image file is too large. Maximum size is 350KB." }, { status: 400 });
    }
`;

content = content.replace('    // 2. Strict On-Chain Transaction Verification with Auto-Sanitization', sizeCheck);

fs.writeFileSync(file, content);
console.log("Patched route.ts");
