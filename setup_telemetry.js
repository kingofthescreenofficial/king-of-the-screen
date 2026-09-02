const fs = require('fs');
const path = require('path');

// 1. Create TelemetryTracker.tsx
fs.writeFileSync('web/components/TelemetryTracker.tsx', `"use client";
import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function TelemetryTracker() {
  const { publicKey } = useWallet();
  const trackedConnection = useRef(false);

  useEffect(() => {
    // 1. Page View
    fetch('/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({ type: 'USER', event: 'PAGE_VIEW', details: { path: window.location.pathname } })
    }).catch(() => {});

    // 2. Ping loop
    const sessionId = Math.random().toString(36).substring(2, 15);
    const ping = () => {
      fetch('/api/ping', { method: 'POST', body: JSON.stringify({ sessionId }) }).catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (publicKey && !trackedConnection.current) {
      trackedConnection.current = true;
      fetch('/api/telemetry', {
        method: 'POST',
        body: JSON.stringify({ type: 'USER', event: 'WALLET_CONNECTED', details: { pubkey: publicKey.toBase58() } })
      }).catch(() => {});
    }
  }, [publicKey]);

  return null;
}
`);

// 2. Inject into layout.tsx
let layoutCode = fs.readFileSync('web/app/layout.tsx', 'utf8');
if (!layoutCode.includes('TelemetryTracker')) {
    layoutCode = layoutCode.replace('import { WalletContextProvider }', 'import { WalletContextProvider }\nimport { TelemetryTracker } from "../components/TelemetryTracker";');
    layoutCode = layoutCode.replace('<WalletContextProvider>{children}</WalletContextProvider>', '<WalletContextProvider><TelemetryTracker />{children}</WalletContextProvider>');
    fs.writeFileSync('web/app/layout.tsx', layoutCode);
}

// 3. Create Ping API
const dirPing = 'web/app/api/ping';
if (!fs.existsSync(dirPing)) fs.mkdirSync(dirPing, { recursive: true });
fs.writeFileSync(path.join(dirPing, 'route.ts'), `import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    const PING_FILE = path.join(process.cwd(), "analytics", "active_users.json");
    let data: Record<string, number> = {};
    if (fs.existsSync(PING_FILE)) {
      data = JSON.parse(fs.readFileSync(PING_FILE, "utf8"));
    }
    const now = Date.now();
    for (const key in data) {
      if (now - data[key] > 30000) delete data[key];
    }
    if (sessionId) data[sessionId] = now;
    
    if (!fs.existsSync(path.dirname(PING_FILE))) fs.mkdirSync(path.dirname(PING_FILE), { recursive: true });
    fs.writeFileSync(PING_FILE, JSON.stringify(data));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}
`);

// 4. Update Dashboard API
let dashCode = fs.readFileSync('web/app/api/admin/dashboard/route.ts', 'utf8');
if (!dashCode.includes('activeUsersCount')) {
    const target = `return NextResponse.json({`;
    const replacement = `let activeUsersCount = 0;
  try {
    const PING_FILE = path.join(process.cwd(), "analytics", "active_users.json");
    if (fs.existsSync(PING_FILE)) {
      const data = JSON.parse(fs.readFileSync(PING_FILE, "utf8"));
      const now = Date.now();
      activeUsersCount = Object.values(data).filter((t: any) => now - t <= 30000).length;
    }
  } catch(e) {}
  
  return NextResponse.json({ activeUsersCount,`;
    dashCode = dashCode.replace(target, replacement);
    fs.writeFileSync('web/app/api/admin/dashboard/route.ts', dashCode);
}

// 5. Update Admin UI
let adminCode = fs.readFileSync('web/app/admin/page.tsx', 'utf8');
if (!adminCode.includes('activeUsers')) {
    adminCode = adminCode.replace('const [queue, setQueue] = useState<any[]>([]);', 'const [queue, setQueue] = useState<any[]>([]);\n  const [activeUsers, setActiveUsers] = useState(0);');
    adminCode = adminCode.replace('setTelemetry(data.telemetry || []);', 'setTelemetry(data.telemetry || []);\n        setActiveUsers(data.activeUsersCount || 0);');
    
    // Add UI badge next to "SYSTEM ONLINE & MONITORING"
    const targetBadge = `<div className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 animate-pulse">
            SYSTEM ONLINE & MONITORING
          </div>`;
    const replacementBadge = `<div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-500/40 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400">ON SITE: {activeUsers}</span>
            </div>
            <div className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
              MONITORING
            </div>
          </div>`;
    adminCode = adminCode.replace(targetBadge, replacementBadge);
    
    // Add lucide Users icon to imports if not there
    if (!adminCode.includes('Users')) {
        adminCode = adminCode.replace('Wallet, Zap, Bell, AlertTriangle, Trash2', 'Wallet, Zap, Bell, AlertTriangle, Trash2, Users');
    }
    fs.writeFileSync('web/app/admin/page.tsx', adminCode);
}

// Remove the faulty ones from page.tsx and TakeoverModal.tsx to prevent duplication
let pageCode = fs.readFileSync('web/app/page.tsx', 'utf8');
pageCode = pageCode.replace(/React.useEffect\(\(\) => \{\n    fetch\('\/api\/telemetry'[\s\S]*?\}, \[\]\);\n/, '');
fs.writeFileSync('web/app/page.tsx', pageCode);

let modalCode = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');
modalCode = modalCode.replace(/fetch\('\/api\/telemetry', \{ method: 'POST', body: JSON.stringify\(\{ type: 'USER', event: 'CLICK_TAKEOVER_MODAL'[\s\S]*?\}\)\).catch\(\(\)=>\{\}\);/, '');
modalCode = modalCode.replace(/fetch\('\/api\/telemetry', \{ method: 'POST', body: JSON.stringify\(\{ type: 'USER', event: 'WALLET_CONNECTED'[\s\S]*?\}\)\).catch\(\(\)=>\{\}\);/, '');
fs.writeFileSync('web/components/TakeoverModal.tsx', modalCode);

console.log("Telemetry fixed and active users added.");
