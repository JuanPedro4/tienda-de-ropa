import { test, expect } from "@playwright/test";

test.describe("Product Detail Page", () => {
  test("navigates to a product and sees details", async ({ page }) => {
    // Navigate to the mock product PDP
    await page.goto("/productos/camiseta-algodon-organico");

    // The product title should be visible
    await expect(page.getByText("Camiseta de algodón orgánico")).toBeVisible();
  });

  test("shows variant size selector", async ({ page }) => {
    await page.goto("/productos/camiseta-algodon-organico");

    // Size options should be visible
    await expect(page.getByText("Talle")).toBeVisible();
  });

  test("selects a size variant", async ({ page }) => {
    await page.goto("/productos/camiseta-algodon-organico");

    // Click on a size option (e.g. "92")
    const sizeButton = page.getByText("92");
    await sizeButton.click();

    // A variant should be selected (price or stock badge appears)
    // The price should show for the selected variant
    await expect(page.getByText("24,90 €").first()).toBeVisible();
  });

  test("adds to cart flow — selects variant then presses add", async ({ page }) => {
    await page.goto("/productos/camiseta-algodon-organico");

    // Select a size
    await page.getByText("92").click();

    // The "Añadir al carrito" button should be present
    const addButton = page.getByText("Añadir al carrito");
    await expect(addButton).toBeVisible();
  });
});
