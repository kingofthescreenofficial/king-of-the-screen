import { afterEach, describe, expect, it } from "vitest";

import { GET } from "@/app/staging/access/route";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("staging access redirect", () => {
  it("keeps the visitor on the current public host after access is granted", async () => {
    process.env.KOTS_RUNTIME_MODE = "staging";
    process.env.SOLANA_CLUSTER = "devnet";
    process.env.STAGING_ACCESS_TOKEN = "test-token";

    const response = await GET(new Request("http://localhost:3000/staging/access?token=test-token"));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/staging?staging_access_token=test-token");
  });
});
