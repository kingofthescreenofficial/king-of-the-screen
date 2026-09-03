import fs from "node:fs";
import path from "node:path";

const source = process.env.KOTS_DATABASE_PATH || path.join(process.cwd(), "data", "kots.sqlite");
const destination = process.argv[2];

if (!destination) {
  throw new Error("Usage: npm run db:backup -- <destination.sqlite>");
}

if (!fs.existsSync(source)) {
  throw new Error("Database file does not exist.");
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
console.log(`Backup created: ${path.basename(destination)}`);
