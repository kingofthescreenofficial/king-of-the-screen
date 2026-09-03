import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders the public coming soon page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "KING OF THE SCREEN" })).toBeVisible();
    await expect(page.getByText("THE THRONE IS BEING PREPARED")).toBeVisible();
    await expect(page.getByText("LAUNCHING SOON")).toBeVisible();
  });

  test("does not expose a wallet transaction path", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: /claim throne|takeovers paused/i })).toHaveCount(0);
  });
});
