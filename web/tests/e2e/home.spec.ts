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

test.describe("design studies", () => {
  test("keeps both studies informational and non-transactional", async ({ page }) => {
    await page.goto("/design-a");
    await expect(page.getByRole("heading", { name: /the screen has a ruler/i })).toBeVisible();
    await expect(page.getByText(/preview only/i)).toBeVisible();
    await expect(page.getByRole("button")).toHaveCount(0);

    await page.goto("/design-b");
    await expect(page.getByRole("heading", { name: /rule the signal/i })).toBeVisible();
    await expect(page.getByText("NO PAYMENTS LIVE")).toBeVisible();
    await expect(page.getByRole("button")).toHaveCount(0);
  });

  test("preserves the original visual system as an inactive study", async ({ page }) => {
    await page.goto("/design-original");
    await expect(page.getByRole("heading", { name: "KING OF THE SCREEN" }).first()).toBeVisible();
    await expect(page.getByText(/takeovers paused/i).first()).toBeVisible();
    await expect(page.getByText(/global monument progress/i)).toBeVisible();
    await expect(page.getByRole("button")).toHaveCount(0);
  });

  test("combines the original neon visual system with the 3D layout", async ({ page }) => {
    await page.goto("/design-hybrid");
    await expect(page.getByRole("heading", { name: /rule the screen/i })).toBeVisible();
    await expect(page.getByText(/original neon. new dimension/i)).toBeVisible();
    await expect(page.getByText(/no payments live/i)).toBeVisible();
    await expect(page.getByRole("button")).toHaveCount(0);
  });
});
