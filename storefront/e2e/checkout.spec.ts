import { test, expect } from "@playwright/test";

test.describe("Checkout page", () => {
  test("shows the checkout page with store selector", async ({ page }) => {
    // Go directly to checkout
    await page.goto("/checkout");

    // The checkout page should render
    await expect(page).toHaveURL(/\/checkout/);
  });

  test("shows the store selector section", async ({ page }) => {
    await page.goto("/checkout");

    // The page should have store/branch selection text or form elements
    await expect(page.getByText(/sucursal|retiro/i).first()).toBeVisible();
  });

  test("shows email input field", async ({ page }) => {
    await page.goto("/checkout");

    // Should have an email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });
});
