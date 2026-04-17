import { expect, test } from "@playwright/test";

const themeKey = "blacksheep-theme";

test("sector routes expose overview assets and timeline views", async ({ page }) => {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "strategy");
  }, themeKey);

  await page.goto("/sectors/self-projects-command/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "strategy");
  await expect(page.locator("html")).toHaveAttribute("data-theme-capability", "command");
  await expect(page.getByRole("button", { name: "总览" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Sector Overview")).toBeVisible();

  await page.getByRole("button", { name: "资产部署" }).click();
  await expect(page.getByRole("link", { name: "打开资产" }).first()).toBeVisible();

  await page.getByRole("button", { name: "时间推进" }).click();
  await expect(page.locator(".timeline-card").first()).toBeVisible();
});
