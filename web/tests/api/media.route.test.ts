import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GET } from "@/app/api/media/[id]/route";
import { closeDatabaseForTests, getDatabase } from "@/lib/database";

let fixtureDirectory = "";
const id = "00000000-0000-4000-8000-000000000001";

beforeEach(() => {
  closeDatabaseForTests();
  fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "kots-media-"));
  process.env.KOTS_DATABASE_PATH = path.join(fixtureDirectory, "kots.sqlite");
  process.env.KOTS_UPLOADS_PATH = path.join(fixtureDirectory, "uploads");
});

afterEach(() => {
  closeDatabaseForTests();
  delete process.env.KOTS_DATABASE_PATH;
  delete process.env.KOTS_UPLOADS_PATH;
  fs.rmSync(fixtureDirectory, { force: true, recursive: true });
});

describe("crowned media route", () => {
  it("does not expose media before the submission is crowned", async () => {
    getDatabase().prepare(`
      INSERT INTO content_submissions (id, status, media_mime, media_storage_key, created_at, updated_at)
      VALUES (?, 'APPROVED', 'image/png', ?, 1, 1)
    `).run(id, `${id}.png`);

    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ id }) });

    expect(response.status).toBe(404);
  });

  it("serves only the exact storage object for a crowned submission", async () => {
    const storageKey = `${id}.png`;
    fs.mkdirSync(process.env.KOTS_UPLOADS_PATH!, { recursive: true });
    fs.writeFileSync(path.join(process.env.KOTS_UPLOADS_PATH!, storageKey), Buffer.from("png"));
    getDatabase().prepare(`
      INSERT INTO content_submissions (id, status, media_mime, media_storage_key, created_at, updated_at)
      VALUES (?, 'CROWNED', 'image/png', ?, 1, 1)
    `).run(id, storageKey);

    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ id }) });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    await expect(response.text()).resolves.toBe("png");
  });
});
