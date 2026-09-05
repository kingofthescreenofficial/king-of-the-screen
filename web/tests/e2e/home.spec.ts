import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders the selected pre-launch design", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "KING OF THE SCREEN" })).toBeVisible();
    await expect(page.getByText("PRE-LAUNCH SIGNAL")).toBeVisible();
    await expect(page.getByText(/takeovers paused/i).first()).toBeVisible();
  });

  test("does not expose a wallet transaction path", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: /claim throne|takeovers paused/i })).toHaveCount(0);
  });
});

test.describe("mechanics status page", () => {
  test("does not publish financial mechanics during pre-launch", async ({ page }) => {
    await page.goto("/mechanics-v1-2");

    await expect(page.getByRole("heading", { name: "MECHANICS ARE NOT PUBLIC TERMS" })).toBeVisible();
    await expect(page.getByText(/Оплаты, NFT, KOTS и иные финансовые механики выключены/)).toBeVisible();
    await expect(page.getByRole("button", { name: /claim throne|takeovers paused/i })).toHaveCount(0);
  });
});

test.describe("pre-launch legal drafts", () => {
  test("states that payment and token mechanics are disabled", async ({ page }) => {
    await page.goto("/legal");
    await expect(page.getByRole("heading", { name: "King of the Screen находится в pre-launch" })).toBeVisible();
    await expect(page.getByText("Нет финансового предложения")).toBeVisible();
    await expect(page.getByText("KOTS, airdrop, claim и рыночные операции")).toBeVisible();
  });
});

test.describe("selected design study", () => {
  test("preserves the original visual system as an inactive study", async ({ page }) => {
    await page.goto("/design-original");
    await expect(page.getByRole("heading", { name: "KING OF THE SCREEN" }).first()).toBeVisible();
    await expect(page.getByText(/takeovers paused/i).first()).toBeVisible();
    await expect(page.getByText(/pre-launch status/i)).toBeVisible();
    await expect(page.getByRole("button")).toHaveCount(0);
  });

});
