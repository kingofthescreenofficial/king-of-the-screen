const fs = require('fs');
let code = fs.readFileSync('web/app/api/takeover/route.ts', 'utf8');
code = `import fs from "fs";\nimport path from "path";\n` + code;
code = code.replace(/import fs from "fs";\nfunction logTelemetry/, 'function logTelemetry');
fs.writeFileSync('web/app/api/takeover/route.ts', code);
