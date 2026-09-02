export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const QUEUE_FILE = path.join(process.cwd(), "analytics", "airdrop_queue.jsonl");

const TELEMETRY_FILE = path.join(process.cwd(), "analytics", "telemetry.jsonl");

export async function GET() {
  let telemetry = [];
  try {
    if (fs.existsSync(TELEMETRY_FILE)) {
      const lines = fs.readFileSync(TELEMETRY_FILE, "utf-8").split("\n").filter(l => l.trim());
      telemetry = lines.slice(-150).map(l => JSON.parse(l)).reverse();
    }
  } catch (e) { console.error(e); }

  let queue = [];
  try {
    if (fs.existsSync(QUEUE_FILE)) {
      const lines = fs.readFileSync(QUEUE_FILE, "utf-8").split("\n").filter(l => l.trim());
      queue = lines.map(l => JSON.parse(l));
    }
  } catch (e) {
    console.error(e);
  }

  return NextResponse.json({
    queueLength: queue.length,
    queue: queue,
    telemetry: telemetry,
  });
}
