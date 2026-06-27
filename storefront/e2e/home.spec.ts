import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("shows hero section with title and CTA button", async ({ page }) => {
    await page.goto("/");

    // Hero section
    await expect(page.getByText("Ropa infantil con estilo")).toBeVisible();
    // CTA button
    await expect(page.getByText("Ver colección")).toBeVisible();
  });

  test("shows categories section", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Categorías")).toBeVisible();
    await expect(page.getByText("Casual")).toBeVisible();
    await expect(page.getByText("Arreglada")).toBeVisible();
    await expect(page.getByText("Deporte")).toBeVisible();
  });

  test("navigates to catalog from CTA button", async ({ page }) => {
    await page.goto("/");

    await page.getByText("Ver colección").click();
    await expect(page).toHaveURL(/\/productos/);
  });
});
