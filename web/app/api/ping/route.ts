import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    const PING_FILE = path.join(process.cwd(), "analytics", "active_users.json");
    let data: Record<string, number> = {};
    if (fs.existsSync(PING_FILE)) {
      data = JSON.parse(fs.readFileSync(PING_FILE, "utf8"));
    }
    const now = Date.now();
    for (const key in data) {
      if (now - data[key] > 30000) delete data[key];
    }
    if (sessionId) data[sessionId] = now;
    
    if (!fs.existsSync(path.dirname(PING_FILE))) fs.mkdirSync(path.dirname(PING_FILE), { recursive: true });
    fs.writeFileSync(PING_FILE, JSON.stringify(data));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}
