import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/*", async (route) => {
      const url = route.request().url();

      if (url.startsWith("http://127.0.0.1:3100")) {
        await route.continue();
        return;
      }

      await route.abort();
    });
  });

  test("renders the current King of the Screen experience", async ({ page }) => {
    await page.goto("/");

  await expect(page.getByRole("heading", { name: "KING OF THE SCREEN" })).toBeVisible();
  await expect(page.getByRole("button", { name: /takeovers paused/i }).first()).toBeVisible();
});

test("opens a paused takeover notice without requesting a wallet transaction", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /takeovers paused/i }).click();

  await expect(page.getByRole("dialog")).toContainText("PAID TAKEOVERS ARE PAUSED");
  await expect(page.getByRole("dialog")).toContainText("No wallet transaction will be requested or sent");
});
});
