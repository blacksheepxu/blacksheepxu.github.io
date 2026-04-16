import { expect, test } from "@playwright/test";

const themeKey = "blacksheep-theme";

test("theme toggle persists across reload and route changes", async ({ page }) => {
  await page.goto("/");

  const root = page.locator("html");
  const toggle = page.locator("[data-theme-toggle]");

  await expect(root).toHaveAttribute("data-theme", "default");
  await expect(root).toHaveAttribute("data-theme-capability", "content");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  await toggle.focus();
  await page.keyboard.press("Enter");

  await expect(root).toHaveAttribute("data-theme", "strategy");
  await expect(root).toHaveAttribute("data-theme-capability", "command");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "strategy");
  await expect(root).toHaveAttribute("data-theme-capability", "command");

  await page.goto("/blog/");
  await expect(root).toHaveAttribute("data-theme", "strategy");
  await expect(root).toHaveAttribute("data-theme-capability", "command");
});

test("unknown stored theme falls back to the default content shell", async ({ page }) => {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "unknown-theme");
  }, themeKey);

  await page.goto("/");

  const root = page.locator("html");
  const toggle = page.locator("[data-theme-toggle]");

  await expect(root).toHaveAttribute("data-theme", "default");
  await expect(root).toHaveAttribute("data-theme-capability", "content");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("heading", { level: 2, name: "研究方向" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "先看战区网络，再下达内容调度。" })).toBeHidden();
});

test("homepage strategy mode exposes command views and hides them in default mode", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "先看战区网络，再下达内容调度。" })).toBeHidden();

  await page.locator("[data-theme-toggle]").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme-capability", "command");
  await expect(page.getByRole("heading", { level: 1, name: "先看战区网络，再下达内容调度。" })).toBeVisible();
  await expect(page.getByText("当前主题战区版图")).toBeVisible();
  await expect(page.getByRole("button", { name: /自研项目推进/ }).first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-map-zone="capital"][data-anchor-kind="fixed"]').first()).toBeVisible();
  await expect(page.getByRole("button", { name: /自研项目推进/ }).first()).toHaveAttribute("data-heat-band", /(hot|warm|cool)/);
  await expect(page.getByRole("link", { name: "查看第一资产" })).toHaveCount(0);

  await page.getByRole("button", { name: /AI 工具侦察/ }).first().click();
  await expect(page.getByRole("heading", { level: 3, name: "AI 工具侦察" })).toBeVisible();
  await expect(page.getByRole("link", { name: "进入战区" })).toBeVisible();
  await page.getByRole("link", { name: "进入战区" }).click();
  await expect(page).toHaveURL(/\/sectors\/ai-tools-intel\/$/);
  await expect(page.getByRole("heading", { level: 2, name: "AI 工具侦察" })).toBeVisible();

  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-capability", "content");
  await expect(page.getByRole("heading", { level: 1, name: "先看战区网络，再下达内容调度。" })).toBeHidden();
});

test("research page switches between map archive and timeline in strategy theme", async ({ page }) => {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "strategy");
  }, themeKey);

  await page.goto("/research/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "strategy");
  await expect(page.locator("html")).toHaveAttribute("data-theme-capability", "command");
  await expect(page.getByText("把研究方向看成一张可读的战区版图")).toBeVisible();

  await page.getByRole("button", { name: "档案" }).click();
  await expect(page.getByText("把研究条目当作情报卷宗来浏览")).toBeVisible();

  await page.getByRole("button", { name: "轨迹" }).click();
  await expect(page.getByText("按最近推进记录回放研究节奏")).toBeVisible();
});

test("blog pages keep dossier structure in strategy theme", async ({ page }) => {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "strategy");
  }, themeKey);

  await page.goto("/blog/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "strategy");
  await expect(page.locator("html")).toHaveAttribute("data-theme-capability", "command");
  await expect(page.getByRole("heading", { level: 2, name: "重点卷宗" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "完整档案" })).toBeVisible();
  await expect(page.getByText("Archive Status Board")).toBeVisible();

  await page.getByRole("link", { name: "打开卷宗" }).first().click();
  await expect(page.getByText("关联路径")).toBeVisible();
  await expect(page.getByText("Article Brief")).toBeVisible();
});
