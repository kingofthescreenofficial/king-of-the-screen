const fs = require('fs');
let code = fs.readFileSync('web/app/admin/page.tsx', 'utf8');

// Remove clearLogs from inside useEffect
code = code.replace(/const clearLogs = async \(\) => {[\s\S]*?};\n\n  const fetchDashboard/m, 'const fetchDashboard');

// Insert clearLogs right before useEffect
const target = 'useEffect(() => {';
const replacement = `const clearLogs = async () => {
    if (!confirm('Очистить все логи телеметрии?')) return;
    try {
      await fetch('/api/telemetry', { method: 'DELETE' });
      setTelemetry([]);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {`;
code = code.replace(target, replacement);

fs.writeFileSync('web/app/admin/page.tsx', code);
console.log("Fixed scope");
