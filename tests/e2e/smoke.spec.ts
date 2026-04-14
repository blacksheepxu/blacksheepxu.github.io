import { expect, test } from "@playwright/test";

test("homepage smoke loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("用 Astro 重建一个更像研究基地");
  await expect(page.getByRole("link", { name: "先看研究方向" })).toBeVisible();
});
