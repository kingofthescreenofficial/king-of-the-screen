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
    await expect(page.getByText(/Первый сезон не обещает цену, прибыль, ликвидность или доставку KOTS/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "KOTS не входит в первый сезон." })).toBeVisible();
    await expect(page.getByRole("button", { name: /claim throne|takeovers paused/i })).toHaveCount(0);
  });
});

test.describe("pre-launch legal drafts", () => {
  test("states that payment and token mechanics are disabled", async ({ page }) => {
    await page.goto("/legal");
    await expect(page.getByRole("heading", { name: "Документы первого сезона" })).toBeVisible();
    await expect(page.getByText("Оплаты, NFT mint, KOTS claim и рыночные операции выключены.")).toBeVisible();
  });
});

test.describe("selected design study", () => {
  test("preserves the original visual system as an inactive study", async ({ page }) => {
    await page.goto("/design-original");
    await expect(page.getByRole("heading", { name: "KING OF THE SCREEN" }).first()).toBeVisible();
    await expect(page.getByText(/takeovers paused/i).first()).toBeVisible();
    await expect(page.getByText(/global monument progress/i)).toBeVisible();
    await expect(page.getByRole("button")).toHaveCount(0);
  });

});
