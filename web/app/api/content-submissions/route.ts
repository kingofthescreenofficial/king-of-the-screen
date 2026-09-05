import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { createContentSubmission } from "@/lib/content-submissions";
import { isContentSubmissionEnabled } from "@/lib/feature-flags";

const MAX_BYTES = 2 * 1024 * 1024;

function detectedMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index])) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes.length >= 6 && Buffer.from(bytes.subarray(0, 6)).toString("ascii") === "GIF87a") return "image/gif";
  if (bytes.length >= 6 && Buffer.from(bytes.subarray(0, 6)).toString("ascii") === "GIF89a") return "image/gif";
  if (bytes.length >= 12 && Buffer.from(bytes.subarray(0, 4)).toString("ascii") === "RIFF" && Buffer.from(bytes.subarray(8, 12)).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

function textField(form: FormData, key: string): string {
  const value = form.get(key);
  if (typeof value !== "string") throw new Error("INVALID_CONTENT");
  return value;
}

export async function POST(request: Request) {
  if (!isContentSubmissionEnabled()) {
    return NextResponse.json({ code: "CONTENT_SUBMISSIONS_DISABLED", error: "Content submission is temporarily paused." }, { status: 503 });
  }
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_BYTES) throw new Error("INVALID_UPLOAD");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mediaMime = detectedMime(bytes);
    if (!mediaMime || mediaMime !== file.type) throw new Error("UNSUPPORTED_MEDIA");
    const sourceHash = createHash("sha256").update(request.headers.get("x-forwarded-for") ?? "unknown").digest("hex");
    const submission = await createContentSubmission({ nickname: textField(form, "nickname"), tagline: textField(form, "tagline"), linkUrl: typeof form.get("linkUrl") === "string" ? textField(form, "linkUrl") : undefined, file, mediaMime, bytes, sourceHash });
    return NextResponse.json({ id: submission.id, contentDigest: submission.contentDigest, status: "APPROVED" }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_CONTENT";
    const statuses: Record<string, number> = { INVALID_UPLOAD: 400, UNSUPPORTED_MEDIA: 415, INVALID_CONTENT: 400, INVALID_LINK_URL: 400, CONTENT_REJECTED: 422, CONTENT_RATE_LIMITED: 429, CONTENT_MODERATION_UNAVAILABLE: 503 };
    return NextResponse.json({ code, error: "Content submission could not be accepted." }, { status: statuses[code] ?? 400 });
  }
}
