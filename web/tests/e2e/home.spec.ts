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

test.describe("mechanics v1.2 page", () => {
  test("explains the draft mechanics without an investment claim", async ({ page }) => {
    await page.goto("/mechanics-v1-2");

    await expect(page.getByRole("heading", { name: "100 KINGS. ONE EXPERIMENT." })).toBeVisible();
    await expect(page.getByText("DRAFT FOR DISCUSSION")).toBeVisible();
    await expect(page.getByText(/\$1,000,000/).first()).toBeVisible();
    await expect(page.getByText(/No price, profit, liquidity, or token delivery is guaranteed/)).toBeVisible();
    await expect(page.getByText("100 фиксированных наград. Новый mint ещё не создан.")).toBeVisible();
    await expect(page.getByRole("button", { name: /claim throne|takeovers paused/i })).toHaveCount(0);
  });
});
