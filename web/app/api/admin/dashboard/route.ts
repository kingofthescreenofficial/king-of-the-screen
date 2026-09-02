import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const QUEUE_FILE = path.join(process.cwd(), "analytics", "airdrop_queue.jsonl");

export async function GET() {
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
  });
}
