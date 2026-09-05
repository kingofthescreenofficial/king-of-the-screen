import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

import { getDatabase } from "@/lib/database";
import { moderateImage, moderateText, type ModerationResult } from "@/lib/moderation";

const MAX_NICKNAME_LENGTH = 48;
const MAX_TAGLINE_LENGTH = 280;
const SUBMISSION_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const SUBMISSION_ATTEMPT_LIMIT = 5;

export type ContentSubmissionInput = {
  nickname: string;
  tagline: string;
  linkUrl?: string;
  file: File;
  mediaMime: string;
  bytes: Uint8Array;
  sourceHash: string;
};

export type ApprovedContentSubmission = {
  id: string;
  contentDigest: string;
  mediaStorageKey: string;
};

function normalizeText(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

function isPrivateHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".local")) return true;
  if (net.isIP(lower) === 4) {
    const octets = lower.split(".").map(Number);
    return octets[0] === 10 || octets[0] === 127 || octets[0] === 0 || (octets[0] === 169 && octets[1] === 254) || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168);
  }
  if (net.isIP(lower) === 6) return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80:");
  return false;
}

function normalizeLinkUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("INVALID_LINK_URL");
  }
  if (url.protocol !== "https:" || url.username || url.password || isPrivateHostname(url.hostname)) throw new Error("INVALID_LINK_URL");
  return url.toString();
}

export function validateContentSubmission(input: ContentSubmissionInput): Omit<ContentSubmissionInput, "nickname" | "tagline" | "linkUrl"> & { nickname: string; tagline: string; linkUrl: string | null } {
  const nickname = normalizeText(input.nickname);
  const tagline = normalizeText(input.tagline);
  if (!nickname || nickname.length > MAX_NICKNAME_LENGTH || !tagline || tagline.length > MAX_TAGLINE_LENGTH) throw new Error("INVALID_CONTENT");
  return { ...input, nickname, tagline, linkUrl: normalizeLinkUrl(input.linkUrl) };
}

export function contentDigest(input: { nickname: string; tagline: string; linkUrl: string | null; mediaMime: string; bytes: Uint8Array }): string {
  const hash = createHash("sha256");
  hash.update("kots-content-v1\u0000");
  hash.update(input.nickname, "utf8");
  hash.update("\u0000");
  hash.update(input.tagline, "utf8");
  hash.update("\u0000");
  hash.update(input.linkUrl ?? "", "utf8");
  hash.update("\u0000");
  hash.update(input.mediaMime, "utf8");
  hash.update("\u0000");
  hash.update(input.bytes);
  return hash.digest("hex");
}

function reviewUnavailable(results: ModerationResult[]): boolean {
  return results.some((result) => result.reviewUnavailable);
}

function rejectionReason(results: ModerationResult[]): string | null {
  return results.find((result) => !result.allowed && !result.reviewUnavailable)?.reason ?? null;
}

function uploadsDirectory(): string {
  return process.env.KOTS_UPLOADS_PATH || path.join(process.cwd(), "data", "uploads");
}

function persistApprovedMedia(storageKey: string, bytes: Uint8Array): void {
  const directory = uploadsDirectory();
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const finalPath = path.join(/* turbopackIgnore: true */ directory, storageKey);
  const temporaryPath = `${finalPath}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporaryPath, bytes, { mode: 0o600 });
  fs.renameSync(temporaryPath, finalPath);
}

function insertSubmission(input: {
  id: string;
  status: "APPROVED" | "REJECTED" | "REVIEW_UNAVAILABLE";
  nickname: string;
  tagline: string;
  linkUrl: string | null;
  mediaMime: string;
  mediaStorageKey: string | null;
  digest: string;
  moderation: ModerationResult[];
  rejectionReason: string | null;
}): void {
  const now = Date.now();
  getDatabase().prepare(`
    INSERT INTO content_submissions (
      id, status, nickname, tagline, link_url, media_mime, media_storage_key, content_digest,
      moderation_provider, moderation_result_json, rejection_reason, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(input.id, input.status, input.nickname, input.tagline, input.linkUrl, input.mediaMime, input.mediaStorageKey,
    input.digest, input.moderation.map((result) => result.provider).join(","), JSON.stringify(input.moderation), input.rejectionReason, now, now);
}

export async function createContentSubmission(input: ContentSubmissionInput): Promise<ApprovedContentSubmission> {
  const validated = validateContentSubmission(input);
  const now = Date.now();
  const database = getDatabase();
  database.prepare("DELETE FROM content_submission_attempts WHERE created_at < ?").run(now - SUBMISSION_ATTEMPT_WINDOW_MS);
  const attempts = (database.prepare("SELECT COUNT(*) AS count FROM content_submission_attempts WHERE source_hash = ? AND created_at >= ?").get(validated.sourceHash, now - SUBMISSION_ATTEMPT_WINDOW_MS) as { count: number }).count;
  if (attempts >= SUBMISSION_ATTEMPT_LIMIT) throw new Error("CONTENT_RATE_LIMITED");
  database.prepare("INSERT INTO content_submission_attempts (id, source_hash, created_at, updated_at) VALUES (?, ?, ?, ?)").run(randomUUID(), validated.sourceHash, now, now);
  const digest = contentDigest(validated);
  const textReview = await moderateText([validated.nickname, validated.tagline, validated.linkUrl ?? ""].join("\n"));
  const reviews = textReview.allowed ? [textReview, await moderateImage(validated.file, validated.file.name)] : [textReview];
  const id = randomUUID();
  const rejection = rejectionReason(reviews);
  const status = reviewUnavailable(reviews) ? "REVIEW_UNAVAILABLE" : rejection ? "REJECTED" : "APPROVED";
  const mediaStorageKey = status === "APPROVED" ? `${id}.${validated.mediaMime.split("/")[1]}` : null;
  if (mediaStorageKey) persistApprovedMedia(mediaStorageKey, validated.bytes);
  insertSubmission({ id, status, nickname: validated.nickname, tagline: validated.tagline, linkUrl: validated.linkUrl, mediaMime: validated.mediaMime, mediaStorageKey, digest, moderation: reviews, rejectionReason: rejection });
  if (status === "REVIEW_UNAVAILABLE") throw new Error("CONTENT_MODERATION_UNAVAILABLE");
  if (status === "REJECTED") throw new Error("CONTENT_REJECTED");
  return { id, contentDigest: digest, mediaStorageKey: mediaStorageKey! };
}

export function getApprovedContentSubmission(id: string): { id: string; contentDigest: string } | null {
  const submission = getDatabase().prepare("SELECT id, content_digest FROM content_submissions WHERE id = ? AND status = 'APPROVED'").get(id) as { id: string; content_digest: string } | undefined;
  return submission ? { id: submission.id, contentDigest: submission.content_digest } : null;
}
