import { NextResponse } from "next/server";
import { touchActiveSession } from "@/lib/database";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json() as { sessionId?: unknown };
    if (typeof sessionId !== "string" || !/^[a-z0-9]{8,32}$/i.test(sessionId)) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    touchActiveSession(sessionId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
