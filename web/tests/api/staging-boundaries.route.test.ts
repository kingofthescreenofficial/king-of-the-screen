import { afterEach, describe, expect, it } from "vitest";

import { POST as reviewContent } from "@/app/api/staging/content-review/route";
import { POST as queueNftPreview } from "@/app/api/staging/nft-queue/route";
import { POST as paymentPreview } from "@/app/api/staging/payment-preview/route";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("staging API boundaries", () => {
  it("keeps every staging endpoint inaccessible outside explicit devnet mode", async () => {
    process.env.KOTS_RUNTIME_MODE = "prelaunch";
    process.env.SOLANA_CLUSTER = "devnet";

    const form = new FormData();
    form.set("displayName", "Test king");
    form.set("message", "Test screen content");
    form.set("file", new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "screen.png", { type: "image/png" }));

    const responses = await Promise.all([
      reviewContent(new Request("http://localhost/api/staging/content-review", { method: "POST", body: form })),
      paymentPreview(new Request("http://localhost/api/staging/payment-preview", { method: "POST", body: JSON.stringify({}) })),
      queueNftPreview(new Request("http://localhost/api/staging/nft-queue", { method: "POST", body: JSON.stringify({}) })),
    ]);

    expect(responses.map((response) => response.status)).toEqual([404, 404, 404]);
    await expect(Promise.all(responses.map((response) => response.json()))).resolves.toEqual([
      expect.objectContaining({ code: "STAGING_DISABLED" }),
      expect.objectContaining({ code: "STAGING_DISABLED" }),
      expect.objectContaining({ code: "STAGING_DISABLED" }),
    ]);
  });
});
