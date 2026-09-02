const fs = require('fs');
const path = require('path');

// 1. Create Telemetry API Route
const dirApi = 'web/app/api/telemetry';
if (!fs.existsSync(dirApi)) fs.mkdirSync(dirApi, { recursive: true });
fs.writeFileSync(path.join(dirApi, 'route.ts'), `import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: body.type || 'SYSTEM', // 'USER' or 'SYSTEM'
            event: body.event,
            details: body.details || {}
        };
        const logDir = path.join(process.cwd(), "analytics");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.appendFileSync(path.join(logDir, "telemetry.jsonl"), JSON.stringify(logEntry) + '\\n');
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
`);

// 2. Update Dashboard API to return telemetry
let dashboardCode = fs.readFileSync('web/app/api/admin/dashboard/route.ts', 'utf8');
const dashboardTarget = `export async function GET() {`;
const dashboardReplacement = `const TELEMETRY_FILE = path.join(process.cwd(), "analytics", "telemetry.jsonl");

export async function GET() {
  let telemetry = [];
  try {
    if (fs.existsSync(TELEMETRY_FILE)) {
      const lines = fs.readFileSync(TELEMETRY_FILE, "utf-8").split("\\n").filter(l => l.trim());
      telemetry = lines.slice(-150).map(l => JSON.parse(l)).reverse();
    }
  } catch (e) { console.error(e); }
`;
dashboardCode = dashboardCode.replace(dashboardTarget, dashboardReplacement);
dashboardCode = dashboardCode.replace(`queue: queue,`, `queue: queue,\n    telemetry: telemetry,`);
fs.writeFileSync('web/app/api/admin/dashboard/route.ts', dashboardCode);

// 3. Update Admin UI
let adminCode = fs.readFileSync('web/app/admin/page.tsx', 'utf8');
adminCode = adminCode.replace(`const [queue, setQueue] = useState<any[]>([]);`, `const [queue, setQueue] = useState<any[]>([]);\n  const [telemetry, setTelemetry] = useState<any[]>([]);`);
adminCode = adminCode.replace(`setQueue(data.queue || []);`, `setQueue(data.queue || []);\n        setTelemetry(data.telemetry || []);`);
const uiTarget = `{/* Action Queue */}`;
const uiReplacement = `{/* TERMINAL / TELEMETRY LOGS */}
        <div className="bg-[#0a0a0f] border-2 border-gray-800 rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
            <h2 className="text-lg font-bold text-gray-300 flex items-center gap-2">
              <Zap className="text-blue-500 w-5 h-5" /> 
              TELEMETRY & SYSTEM LOGS (LIVE)
            </h2>
          </div>
          
          <div className="bg-black border border-gray-800 rounded-xl h-96 overflow-y-auto p-4 font-mono text-[11px] sm:text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800">
            {telemetry.length === 0 ? (
              <div className="text-gray-600 italic">No telemetry data yet...</div>
            ) : (
              telemetry.map((log, idx) => (
                <div key={idx} className="flex gap-3 hover:bg-gray-900/50 p-1 rounded transition-colors">
                  <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={\`shrink-0 font-bold \${log.type === 'USER' ? 'text-blue-400' : 'text-purple-400'}\`}>[{log.type}]</span>
                  <span className={\`shrink-0 \${log.type === 'USER' ? 'text-blue-200' : 'text-purple-200'}\`}>{log.event}</span>
                  <span className="text-gray-400 truncate w-full">{JSON.stringify(log.details)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Queue */}`;
adminCode = adminCode.replace(uiTarget, uiReplacement);
fs.writeFileSync('web/app/admin/page.tsx', adminCode);

console.log("Telemetry infrastructure added.");
