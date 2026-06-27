import { test, expect } from "@playwright/test";

test.describe("Admin section", () => {
  test("redirects unauthenticated user to login", async ({ page }) => {
    // Navigate to admin without being logged in
    const response = await page.goto("/admin");

    // Should redirect to login page (middleware redirect)
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin dashboard page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/admin/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin productos page requires auth", async ({ page }) => {
    await page.goto("/admin/productos");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
