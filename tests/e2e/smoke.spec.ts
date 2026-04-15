import { expect, test } from "@playwright/test";

test("homepage smoke loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("把研究、写作和实验放在同一个站里");
  await expect(page.getByRole("link", { name: "看实验", exact: true })).toBeVisible();
});
