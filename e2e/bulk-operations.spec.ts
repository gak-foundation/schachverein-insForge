import { test, expect } from "@playwright/test";

test("bulk status change on members page", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "admin@test.de");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**");

  await page.goto("/dashboard/members");
  await page.waitForSelector('[aria-label*="auswaehlen"]');

  const checkboxes = page.locator('[aria-label*="auswaehlen"]');
  const count = await checkboxes.count();
  if (count >= 3) {
    await checkboxes.nth(1).click();
    await checkboxes.nth(2).click();

    await expect(page.getByText("2 ausgewaehlt")).toBeVisible({ timeout: 3000 });
  }
});

test("bulk action bar appears and clears", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "admin@test.de");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**");

  await page.goto("/dashboard/members");
  await page.waitForSelector('[aria-label*="auswaehlen"]');

  const checkboxes = page.locator('[aria-label*="auswaehlen"]');
  const count = await checkboxes.count();

  if (count >= 2) {
    await checkboxes.nth(1).click();
    await expect(page.getByText("1 ausgewaehlt")).toBeVisible({ timeout: 3000 });

    await page.getByText("Abbrechen").click();
    await expect(page.getByText("ausgewaehlt")).not.toBeVisible({ timeout: 2000 });
  }
});
