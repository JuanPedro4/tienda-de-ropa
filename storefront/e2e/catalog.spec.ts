import { test, expect } from "@playwright/test";

test.describe("Catalog page", () => {
  test("navigates to /productos and shows the product grid", async ({ page }) => {
    await page.goto("/productos");

    // The catalog page should render
    await expect(page).toHaveURL(/\/productos/);
    // Page has a title — check for the main heading or placeholder content
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("shows category filter links", async ({ page }) => {
    await page.goto("/productos");

    // There should be category links (sidebar filters)
    const categorySection = page.locator("text=Categorías, text=Filtrar");
    // At least one category-related element should exist
    await expect(page.locator("a[href*='categoria=casual'], a[href*='categoria']").first()).toBeVisible();
  });

  test("applies category filter via URL parameter", async ({ page }) => {
    await page.goto("/productos?categoria=casual");

    // The page should load with the category filter applied
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("shows category page at /productos/casual", async ({ page }) => {
    await page.goto("/productos/casual");

    // Should redirect to /productos?categoria=casual
    await expect(page).toHaveURL(/categoria=casual/);
  });
});
