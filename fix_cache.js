const fs = require('fs');
let code = fs.readFileSync('web/app/api/admin/dashboard/route.ts', 'utf8');
if (!code.includes('force-dynamic')) {
    code = `export const dynamic = "force-dynamic";\n` + code;
    fs.writeFileSync('web/app/api/admin/dashboard/route.ts', code);
}
