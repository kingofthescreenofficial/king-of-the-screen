import { describe, expect, it } from "vitest";

import { PHANTOM_DOWNLOAD_URL, buildPhantomBrowseUrl, isMobileUserAgent } from "@/lib/phantom-browser";

describe("Phantom browser handoff", () => {
  it("detects mobile browsers without matching desktop user agents", () => {
    expect(isMobileUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe(true);
    expect(isMobileUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe(false);
  });

  it("builds a Phantom browse link with encoded destination and referrer", () => {
    expect(buildPhantomBrowseUrl("https://staging.example/staging/access?token=test", "https://staging.example")).toBe(
      "https://phantom.app/ul/browse/https%3A%2F%2Fstaging.example%2Fstaging%2Faccess%3Ftoken%3Dtest?ref=https%3A%2F%2Fstaging.example",
    );
    expect(PHANTOM_DOWNLOAD_URL).toBe("https://phantom.app/download");
  });
});
