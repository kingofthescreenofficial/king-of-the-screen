const fs = require('fs');
let code = fs.readFileSync('web/app/api/takeover/route.ts', 'utf8');
code = code.replace(/function logTelemetry\(type, event, details\)/, 'function logTelemetry(type: string, event: string, details: any)');
fs.writeFileSync('web/app/api/takeover/route.ts', code);
