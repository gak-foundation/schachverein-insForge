import { test, expect } from "@playwright/test";

test("matrix entry tab renders on tournament page", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "admin@test.de");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**");

  await page.goto("/dashboard/tournaments");

  const firstLink = page.locator('a[href*="/dashboard/tournaments/"]').first();
  if (await firstLink.isVisible()) {
    await firstLink.click();
    await page.waitForURL("**/dashboard/tournaments/**");

    await expect(page.getByText("Schnelleingabe")).toBeVisible({ timeout: 3000 });
  }
});
