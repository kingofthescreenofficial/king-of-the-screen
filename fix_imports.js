const fs = require('fs');
let code = fs.readFileSync('web/app/api/takeover/route.ts', 'utf8');
code = code.replace(/import fs from "fs";\nimport path from "path";/, '');
fs.writeFileSync('web/app/api/takeover/route.ts', code);
