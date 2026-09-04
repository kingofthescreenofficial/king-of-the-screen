import { afterEach, describe, expect, it, vi } from "vitest";

import { moderateImage, moderateText } from "@/lib/moderation";

const originalSightengineUser = process.env.SIGHTENGINE_USER;
const originalSightengineSecret = process.env.SIGHTENGINE_SECRET;
const originalOpenAiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalSightengineUser === undefined) delete process.env.SIGHTENGINE_USER;
  else process.env.SIGHTENGINE_USER = originalSightengineUser;
  if (originalSightengineSecret === undefined) delete process.env.SIGHTENGINE_SECRET;
  else process.env.SIGHTENGINE_SECRET = originalSightengineSecret;
  if (originalOpenAiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalOpenAiKey;
});

describe("content moderation", () => {
  it("rejects locally prohibited text without calling a provider", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(moderateText("claim-airdrop-now")).resolves.toMatchObject({
      allowed: false,
      provider: "local",
      reviewUnavailable: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when no text moderation provider is configured", async () => {
    delete process.env.SIGHTENGINE_USER;
    delete process.env.SIGHTENGINE_SECRET;
    delete process.env.OPENAI_API_KEY;

    await expect(moderateText("A safe public message")).resolves.toMatchObject({
      allowed: false,
      provider: "unavailable",
      reviewUnavailable: true,
    });
  });

  it("rejects an image when Sightengine flags it", async () => {
    process.env.SIGHTENGINE_USER = "user";
    process.env.SIGHTENGINE_SECRET = "secret";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "success",
      nudity: { sexual_activity: 0.9, sexual_display: 0, erotica: 0 },
      weapon: 0,
      offensive: { prob: 0 },
      gore: { prob: 0 },
    }), { status: 200 })));

    await expect(moderateImage(new Blob(["image"], { type: "image/png" }), "image.png")).resolves.toMatchObject({
      allowed: false,
      provider: "sightengine",
      reviewUnavailable: false,
    });
  });
});
