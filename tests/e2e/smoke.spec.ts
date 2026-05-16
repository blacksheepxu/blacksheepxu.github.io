import { expect, test } from "@playwright/test";

test("homepage smoke loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("把研究、写作和实验放在同一个站里");
  await expect(page.getByRole("link", { name: "看实验", exact: true })).toBeVisible();
});

test("site sidebar opens from the right-side launcher", async ({ page }) => {
  await page.goto("/");
  const launcher = page.getByRole("button", { name: "打开站点侧栏" });

  await expect(launcher).toBeVisible();
  await expect(launcher).toHaveAttribute("aria-expanded", "false");

  await launcher.click();
  await expect(launcher).toHaveAttribute("aria-expanded", "true");
  const sidebar = page.getByRole("dialog", { name: "Blacksheep" });
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByRole("link", { name: /项目卷宗/ })).toBeVisible();

  await page.getByRole("button", { name: "关闭站点侧栏" }).click();
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
});
