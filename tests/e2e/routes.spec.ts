import { expect, test } from "@playwright/test";

test("legacy article route stays accessible", async ({ page }) => {
  await page.goto("/2019/11/28/%E7%94%A8numpy%E5%AE%9E%E7%8E%B0%E4%B8%80%E4%B8%AA%E5%8F%8C%E5%B1%82%E7%9A%84softmax%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toContainText("用numpy实现一个双层的softmax神经网络");
});

test("taxonomy routes stay accessible", async ({ page }) => {
  await page.goto("/tags/deeplearning/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("标签：deeplearning");
  await expect(page.getByRole("link", { name: "打开文章" }).first()).toBeVisible();

  await page.goto("/categories/deeplearning/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("分类：deeplearning");
});

test("blog archive highlights writing inventory", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("博客");
  await expect(page.getByText("文章总数")).toBeVisible();
  await expect(page.getByRole("link", { name: "打开文章" }).first()).toBeVisible();
});

test("research page presents mapped tracks", async ({ page }) => {
  await page.goto("/research/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("研究");
  await expect(page.locator(".channel-metric").filter({ hasText: "研究轨道" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "查看方向" }).first()).toBeVisible();
});

test("research detail page uses unified detail shell", async ({ page }) => {
  await page.goto("/research/ai-research-station/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("当前研究版图");
  await expect(page.locator(".channel-metric").filter({ hasText: "研究焦点" }).first()).toBeVisible();
});

test("lab page presents interaction entries", async ({ page }) => {
  await page.goto("/lab/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("实验");
  await expect(page.getByText("实验数量")).toBeVisible();
  await expect(page.getByRole("link", { name: "打开实验" }).first()).toBeVisible();
});

test("lab detail page uses unified detail shell", async ({ page }) => {
  await page.goto("/lab/research-cadence-demo/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("研究节奏与主题投入");
  await expect(page.locator(".channel-metric").filter({ hasText: "实验类型" }).first()).toBeVisible();
});

test("about page explains site structure", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("关于这个站");
  await expect(page.getByText("站点结构")).toBeVisible();
});

test("update route provides content entry points", async ({ page }) => {
  await page.goto("/update/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("更新");
  await expect(page.getByText("src/content/posts/")).toBeVisible();
});

test("legacy article math renders with katex", async ({ page }) => {
  await page.goto("/2020/02/01/Paper-GAN-GenerativeOneShotFaceRecognition/");
  await expect(page.locator(".katex").first()).toBeVisible();
});

test("legacy code blocks are rebuilt into Astro-highlighted blocks", async ({ page }) => {
  await page.goto("/2020/02/01/Pytorch-1-Tensor%E6%98%AF%E4%BB%80%E4%B9%88/");
  await expect(page.locator("pre.astro-code").first()).toBeVisible();
  await expect(page.locator("figure.highlight").first()).toHaveCount(0);
});
