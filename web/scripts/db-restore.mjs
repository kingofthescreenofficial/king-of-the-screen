import fs from "node:fs";
import path from "node:path";

const source = process.argv[2];
const destination = process.env.KOTS_DATABASE_PATH || path.join(process.cwd(), "data", "kots.sqlite");

if (!source) {
  throw new Error("Usage: npm run db:restore -- <backup.sqlite>");
}

if (!fs.existsSync(source)) {
  throw new Error("Backup file does not exist.");
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
console.log(`Database restored: ${path.basename(destination)}`);
