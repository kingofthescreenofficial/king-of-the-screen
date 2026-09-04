import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/database";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function uploadsDirectory(): string {
  return process.env.KOTS_UPLOADS_PATH || path.join(process.cwd(), "data", "uploads");
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) return new NextResponse(null, { status: 404 });
  const row = getDatabase().prepare(`
    SELECT media_storage_key, media_mime FROM content_submissions
    WHERE id = ? AND status = 'CROWNED'
  `).get(id) as { media_storage_key: string | null; media_mime: string | null } | undefined;
  if (!row?.media_storage_key || !row.media_mime || !row.media_storage_key.startsWith(`${id}.`)) return new NextResponse(null, { status: 404 });
  const directory = uploadsDirectory();
  const candidate = path.resolve(/* turbopackIgnore: true */ directory, row.media_storage_key);
  if (!candidate.startsWith(`${path.resolve(/* turbopackIgnore: true */ directory)}${path.sep}`)) return new NextResponse(null, { status: 404 });
  try {
    const content = fs.readFileSync(/* turbopackIgnore: true */ candidate);
    return new NextResponse(content, { headers: { "Content-Type": row.media_mime, "Cache-Control": "public, max-age=300" } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
