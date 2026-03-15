import { expect, test } from "@playwright/test";

// solo agrege esra como base para que agregen sus pruebas
test("carga la pagina principal", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
});
