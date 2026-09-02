import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: body.type || 'SYSTEM', // 'USER' or 'SYSTEM'
            event: body.event,
            details: body.details || {}
        };
        const logDir = path.join(process.cwd(), "analytics");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.appendFileSync(path.join(logDir, "telemetry.jsonl"), JSON.stringify(logEntry) + '\n');
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
