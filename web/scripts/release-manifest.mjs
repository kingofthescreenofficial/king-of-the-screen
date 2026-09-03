import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const hash = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
console.log(JSON.stringify({ commit, node: process.version, lockfileSha256: hash("package-lock.json") }));
