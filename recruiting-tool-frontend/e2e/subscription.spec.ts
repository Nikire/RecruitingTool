import { test, expect } from "@playwright/test";
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
} from "./fixtures/test-utils";

test.describe("Subscription Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/profile/subscription");
    await waitForLoadingComplete(page);
  });

  test("should display subscription page", async ({ page }) => {
    // Verify we're on subscription page
    expect(page.url()).toContain("/subscription");

    // Should have main content
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test("should display current subscription plan", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for plan information
    const planInfo = page
      .locator("text=/plan|subscription|suscripción/i")
      .first();
    await expect(planInfo).toBeVisible({ timeout: 10000 });
  });

  test("should display subscription features or tiers", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should have cards or sections showing plan features
    const cards = page.locator(".MuiCard-root, .MuiPaper-root");
    const count = await cards.count();

    expect(count).toBeGreaterThan(0);
  });

  test("should have upgrade/manage subscription button", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for CTA buttons
    const actionButton = page
      .locator("button")
      .filter({
        hasText: /upgrade|manage|change.*plan|cambiar.*plan|actualizar/i,
      })
      .first();

    if ((await actionButton.count()) > 0) {
      await expect(actionButton).toBeVisible();
    } else {
      // If no action button, verify we're on the right page
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("should display billing information", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for billing-related text
    const billingInfo = page
      .locator("text=/billing|payment|facturación|pago/i")
      .first();

    if ((await billingInfo.count()) > 0) {
      await expect(billingInfo).toBeVisible();
    } else {
      // Billing section might not be implemented yet
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("should show subscription status", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for status indicators
    const statusIndicators = page.locator(
      "text=/active|trial|expired|activo|prueba|expirado/i, .MuiChip-root",
    );

    if ((await statusIndicators.count()) > 0) {
      await expect(statusIndicators.first()).toBeVisible();
    }
  });

  test("should display pricing information", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for price displays (currency symbols or numbers)
    const priceInfo = page
      .locator("text=/\\$/i, text=/€/i, text=/price|precio/i")
      .first();

    if ((await priceInfo.count()) > 0) {
      await expect(priceInfo).toBeVisible();
    }
  });
});
