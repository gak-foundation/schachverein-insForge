import { test, expect } from "@playwright/test";

test("Startseite zeigt Hero-Überschrift", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Die All-in-One-Schachvereinssoftware/i })).toBeVisible();
});
