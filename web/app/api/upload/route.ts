import { NextResponse } from "next/server";

const MAX_BYTES = 2 * 1024 * 1024;

function detectedMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index])) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes.length >= 6 && Buffer.from(bytes.subarray(0, 6)).toString("ascii") === "GIF87a") return "image/gif";
  if (bytes.length >= 6 && Buffer.from(bytes.subarray(0, 6)).toString("ascii") === "GIF89a") return "image/gif";
  if (bytes.length >= 12 && Buffer.from(bytes.subarray(0, 4)).toString("ascii") === "RIFF" && Buffer.from(bytes.subarray(8, 12)).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ code: "INVALID_UPLOAD", error: "Upload is invalid." }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = detectedMime(bytes);
    if (!mime || mime !== file.type) {
      return NextResponse.json({ code: "UNSUPPORTED_MEDIA", error: "Only verified raster images are supported." }, { status: 415 });
    }
    return NextResponse.json({ code: "CONTENT_REVIEW_NOT_READY", error: "Content upload is temporarily unavailable." }, { status: 503 });
  } catch {
    return NextResponse.json({ code: "INVALID_UPLOAD", error: "Upload is invalid." }, { status: 400 });
  }
}
