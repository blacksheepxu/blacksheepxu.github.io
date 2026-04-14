import { expect, test } from "@playwright/test";

test("lab interactions toggle views and panels", async ({ page }) => {
  await page.goto("/lab/research-cadence-demo/");

  const cadenceRoot = page.locator("[data-cadence-root]");
  await expect(cadenceRoot.locator("[data-chart-summary]")).toContainText("当前视图包含");
  await cadenceRoot.getByRole("button", { name: "全部" }).click();
  await expect(cadenceRoot.locator("[data-chart-summary]")).toContainText("共 12 篇内容");

  await page.getByRole("button", { name: "依据" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "它解决的问题" })).toBeVisible();
});
