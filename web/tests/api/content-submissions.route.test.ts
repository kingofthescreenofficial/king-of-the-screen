import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/content-submissions/route";
import { closeDatabaseForTests, getDatabase } from "@/lib/database";

let fixtureDirectory = "";
const originalSightengineUser = process.env.SIGHTENGINE_USER;
const originalSightengineSecret = process.env.SIGHTENGINE_SECRET;
const originalOpenAiKey = process.env.OPENAI_API_KEY;

beforeEach(() => {
  closeDatabaseForTests();
  fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "kots-submission-"));
  process.env.KOTS_DATABASE_PATH = path.join(fixtureDirectory, "kots.sqlite");
  process.env.KOTS_UPLOADS_PATH = path.join(fixtureDirectory, "uploads");
  delete process.env.SIGHTENGINE_USER;
  delete process.env.SIGHTENGINE_SECRET;
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  closeDatabaseForTests();
  delete process.env.KOTS_DATABASE_PATH;
  delete process.env.KOTS_UPLOADS_PATH;
  if (originalSightengineUser === undefined) delete process.env.SIGHTENGINE_USER;
  else process.env.SIGHTENGINE_USER = originalSightengineUser;
  if (originalSightengineSecret === undefined) delete process.env.SIGHTENGINE_SECRET;
  else process.env.SIGHTENGINE_SECRET = originalSightengineSecret;
  if (originalOpenAiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalOpenAiKey;
  fs.rmSync(fixtureDirectory, { force: true, recursive: true });
});

describe("content submission route", () => {
  it("fails closed and does not store a file when automated moderation is unavailable", async () => {
    const form = new FormData();
    form.set("nickname", "King One");
    form.set("tagline", "A safe public message");
    form.set("file", new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "screen.png", { type: "image/png" }));

    const response = await POST(new Request("http://localhost/api/content-submissions", { method: "POST", body: form }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ code: "CONTENT_MODERATION_UNAVAILABLE" });
    expect(getDatabase().prepare("SELECT status, media_storage_key FROM content_submissions").all()).toEqual([
      { status: "REVIEW_UNAVAILABLE", media_storage_key: null },
    ]);
    expect(fs.existsSync(process.env.KOTS_UPLOADS_PATH!)).toBe(false);
  });
});
