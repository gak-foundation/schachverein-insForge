import { test, expect } from "@playwright/test";

test("impersonation route returns 403 for non-admin", async ({ request }) => {
  const response = await request.post("/api/auth/impersonate", {
    data: { clubId: "test-club-id" },
  });
  expect(response.status()).toBe(403);
});

test("unimpersonate redirects to super-admin", async ({ page }) => {
  await page.goto("/api/auth/unimpersonate");
  await page.waitForURL("**/super-admin**");
});
