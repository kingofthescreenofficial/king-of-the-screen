import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const source = process.env.KOTS_DATABASE_PATH || path.join(process.cwd(), "data", "kots.sqlite");
const destination = process.argv[2];

if (!destination) {
  throw new Error("Usage: npm run db:backup -- <destination.sqlite>");
}

if (!fs.existsSync(source)) {
  throw new Error("Database file does not exist.");
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
const database = new Database(source, { readonly: true });
await database.backup(destination);
database.close();
console.log(`Backup created: ${path.basename(destination)}`);
