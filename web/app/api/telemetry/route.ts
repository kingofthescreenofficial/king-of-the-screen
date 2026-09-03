import { NextResponse } from "next/server";
import { writeTelemetryPageView } from "@/lib/database";

const MAX_PATH_LENGTH = 200;

function isAllowedPageView(body: unknown): body is { type: "USER"; event: "PAGE_VIEW"; details: { path: string } } {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  const details = value.details as Record<string, unknown> | undefined;

  return value.type === "USER"
    && value.event === "PAGE_VIEW"
    && !!details
    && typeof details.path === "string"
    && details.path.startsWith("/")
    && details.path.length <= MAX_PATH_LENGTH;
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!isAllowedPageView(body)) {
      return NextResponse.json({ code: "INVALID_TELEMETRY", error: "Unsupported telemetry event." }, { status: 400 });
    }

    writeTelemetryPageView(body.details.path);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ code: "INVALID_TELEMETRY", error: "Invalid telemetry payload." }, { status: 400 });
  }
}

export async function DELETE() {
  return NextResponse.json(
    { code: "ADMIN_AUTH_REQUIRED", error: "Admin access is temporarily unavailable." },
    { status: 401 },
  );
}
