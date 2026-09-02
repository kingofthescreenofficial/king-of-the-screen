const fs = require('fs');
let routeCode = fs.readFileSync('web/app/api/takeover/route.ts', 'utf8');

if (!routeCode.includes('TAKEOVER_API_CALLED')) {
    const importReplacement = `import fs from "fs";
import path from "path";

function logTelemetry(type, event, details) {
  try {
    const logDir = path.join(process.cwd(), "analytics");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logEntry = { timestamp: new Date().toISOString(), type, event, details };
    fs.appendFileSync(path.join(logDir, "telemetry.jsonl"), JSON.stringify(logEntry) + '\\n');
  } catch(e) {}
}

export async function POST`;
    routeCode = routeCode.replace('export async function POST', importReplacement);

    routeCode = routeCode.replace(
        'const body = await request.json();',
        `const body = await request.json();
    logTelemetry('SYSTEM', 'TAKEOVER_API_CALLED', { nickname: body.nickname, amount: body.amountUsd });`
    );

    routeCode = routeCode.replace(
        '// 3. Update the JSON state',
        `logTelemetry('SYSTEM', 'TAKEOVER_SUCCESS', { kingId: newKing.id, nickname: newKing.nickname });
    // 3. Update the JSON state`
    );

    fs.writeFileSync('web/app/api/takeover/route.ts', routeCode);
    console.log("Patched takeover route.ts");
}

let sentinelCode = fs.readFileSync('airdrop_sentinel.js', 'utf8');
if (!sentinelCode.includes('logTelemetry')) {
    const fnDef = `function logTelemetry(type, event, details) {
  try {
    const logDir = path.join(process.cwd(), "web/analytics");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logEntry = { timestamp: new Date().toISOString(), type, event, details };
    fs.appendFileSync(path.join(logDir, "telemetry.jsonl"), JSON.stringify(logEntry) + '\\n');
  } catch(e) {}
}

const connection =`;
    sentinelCode = sentinelCode.replace('const connection =', fnDef);
    
    sentinelCode = sentinelCode.replace(
        'console.log(`\\n[👑] Found new King in queue: ${entry.nickname} (${entry.kingId})`);',
        `console.log(\`\\n[👑] Found new King in queue: \${entry.nickname} (\${entry.kingId})\`);
      logTelemetry('SYSTEM', 'SENTINEL_PROCESSING_KING', { kingId: entry.kingId });`
    );

    sentinelCode = sentinelCode.replace(
        'console.log(`✅ NFT Minted Successfully! Mint:`, nft.address.toBase58());',
        `console.log(\`✅ NFT Minted Successfully! Mint:\`, nft.address.toBase58());
        logTelemetry('SYSTEM', 'NFT_MINTED', { mint: nft.address.toBase58(), to: destinationWallet.toBase58() });`
    );

    fs.writeFileSync('airdrop_sentinel.js', sentinelCode);
    console.log("Patched sentinel");
}

