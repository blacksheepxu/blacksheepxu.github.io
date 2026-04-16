import { expect, test } from "@playwright/test";

const themeKey = "blacksheep-theme";

test("update page points maintainers to theme governance assets", async ({ page }) => {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "strategy");
  }, themeKey);

  await page.goto("/update/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "strategy");
  await expect(page.getByText("主题维护手册")).toBeVisible();
  await expect(page.getByText("docs/theme-maintenance.md")).toBeVisible();
  await expect(page.getByText("docs/checklists/theme-code-change-checklist.md")).toBeVisible();
  await expect(page.getByText("docs/checklists/theme-content-update-checklist.md")).toBeVisible();
});
