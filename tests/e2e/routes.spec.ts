import { expect, test } from "@playwright/test";

test("legacy article route stays accessible", async ({ page }) => {
  await page.goto("/2019/11/28/%E7%94%A8numpy%E5%AE%9E%E7%8E%B0%E4%B8%80%E4%B8%AA%E5%8F%8C%E5%B1%82%E7%9A%84softmax%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C/");
  await expect(page.locator("article .section-head h1").first()).toContainText("用numpy实现一个双层的softmax神经网络");
});

test("taxonomy routes stay accessible", async ({ page }) => {
  await page.goto("/tags/deeplearning/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("标签：deeplearning");

  await page.goto("/categories/deeplearning/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("分类：deeplearning");
});
