const fs = require('fs');
const path = require('path');

// 1. Add DELETE to /api/telemetry
let apiCode = fs.readFileSync('web/app/api/telemetry/route.ts', 'utf8');
if (!apiCode.includes('export async function DELETE')) {
    apiCode += `
export async function DELETE() {
    try {
        const logFile = path.join(process.cwd(), "analytics", "telemetry.jsonl");
        if (fs.existsSync(logFile)) fs.writeFileSync(logFile, "");
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
`;
    fs.writeFileSync('web/app/api/telemetry/route.ts', apiCode);
}

// 2. Add Clear Button to Admin UI
let adminCode = fs.readFileSync('web/app/admin/page.tsx', 'utf8');
if (!adminCode.includes('clearLogs')) {
    // Add Trash2 icon
    adminCode = adminCode.replace('Bell, AlertTriangle', 'Bell, AlertTriangle, Trash2');
    
    // Add clear function
    const funcTarget = `const fetchDashboard = async () => {`;
    const funcReplacement = `const clearLogs = async () => {
    if (!confirm('Очистить все логи телеметрии?')) return;
    try {
      await fetch('/api/telemetry', { method: 'DELETE' });
      setTelemetry([]);
    } catch (e) { console.error(e); }
  };

  const fetchDashboard = async () => {`;
    adminCode = adminCode.replace(funcTarget, funcReplacement);

    // Add button UI
    const uiTarget = `TELEMETRY & SYSTEM LOGS (LIVE)
            </h2>`;
    const uiReplacement = `TELEMETRY & SYSTEM LOGS (LIVE)
            </h2>
            <button onClick={clearLogs} className="flex items-center gap-1.5 text-xs bg-red-950/40 hover:bg-red-900/60 text-red-400 px-3 py-1.5 rounded-lg border border-red-900/50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Очистить
            </button>`;
    adminCode = adminCode.replace(uiTarget, uiReplacement);
    
    fs.writeFileSync('web/app/admin/page.tsx', adminCode);
}
console.log("Done");
