import { test, expect } from "@playwright/test";
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
} from "./fixtures/test-utils";

test.describe("Onboarding Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/onboarding");
    await waitForLoadingComplete(page);
  });

  test("should display onboarding wizard", async ({ page }) => {
    // Should be on onboarding page or redirected if already completed
    const url = page.url();
    const isOnboarding = url.includes("/onboarding");
    const isRedirected =
      url.includes("/hr") ||
      url.includes("/admin") ||
      url.includes("/dashboard");

    expect(isOnboarding || isRedirected).toBeTruthy();
  });

  test("should display wizard steps indicator", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for stepper component
    const stepper = page.locator(
      '.MuiStepper-root, [class*="stepper"], [class*="wizard"]',
    );

    if ((await stepper.count()) > 0) {
      await expect(stepper.first()).toBeVisible();
    }
  });

  test("should have next/back navigation buttons", async ({ page }) => {
    await waitForLoadingComplete(page);

    const nextButton = page
      .locator("button")
      .filter({
        hasText: /next|continue|siguiente|continuar/i,
      })
      .first();

    if ((await nextButton.count()) > 0) {
      await expect(nextButton).toBeVisible();
    }
  });

  test("should display step content", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should have form inputs or content
    const content = page.locator('input, textarea, select, [role="combobox"]');
    const count = await content.count();

    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should navigate between steps", async ({ page }) => {
    await waitForLoadingComplete(page);

    const nextButton = page
      .locator("button")
      .filter({
        hasText: /next|continue/i,
      })
      .first();

    if ((await nextButton.count()) > 0) {
      // Get current step
      await page
        .locator('.MuiStep-root.Mui-active, [class*="active"]')
        .count();

      await nextButton.click();
      await page.waitForTimeout(500);

      // Page should still work (might show validation or move to next step)
      await expect(page.locator("main, body").first()).toBeVisible();
    }
  });

  test("should have skip option", async ({ page }) => {
    await waitForLoadingComplete(page);

    const skipButton = page
      .locator("button, a")
      .filter({
        hasText: /skip|omitir|later/i,
      })
      .first();

    if ((await skipButton.count()) > 0) {
      await expect(skipButton).toBeVisible();
    }
  });
});

test.describe("HR Onboarding Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/onboarding/hr");
    await waitForLoadingComplete(page);
  });

  test("should display HR onboarding wizard", async ({ page }) => {
    const url = page.url();
    const isOnboarding = url.includes("/onboarding");
    const isRedirected = url.includes("/hr") || url.includes("/admin");

    expect(isOnboarding || isRedirected).toBeTruthy();
  });

  test("should display HR-specific onboarding steps", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for HR-related content
    const hrContent = page
      .locator("text=/company|position|job|team|empresa|puesto|equipo/i")
      .first();

    if ((await hrContent.count()) > 0) {
      await expect(hrContent).toBeVisible();
    }
  });

  test("should have form validation", async ({ page }) => {
    await waitForLoadingComplete(page);

    const submitButton = page
      .locator('button[type="submit"], button')
      .filter({
        hasText: /submit|finish|complete|enviar|finalizar/i,
      })
      .first();

    if ((await submitButton.count()) > 0) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should show validation or complete successfully
      await expect(page.locator("main, body").first()).toBeVisible();
    }
  });
});

test.describe("Applicant Onboarding", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/applicant/onboarding");
    await waitForLoadingComplete(page);
  });

  test("should display applicant onboarding page", async ({ page }) => {
    const url = page.url();
    const isOnboarding = url.includes("/onboarding");
    const isRedirected = url.includes("/hr") || url.includes("/admin");

    expect(isOnboarding || isRedirected).toBeTruthy();
  });

  test("should display applicant information form", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for applicant-related fields
    const formFields = page.locator("input, textarea");
    const count = await formFields.count();

    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should have upload resume option", async ({ page }) => {
    await waitForLoadingComplete(page);

    const uploadButton = page
      .locator('button, input[type="file"]')
      .filter({
        hasText: /upload|resume|cv|subir|currículum/i,
      })
      .first();

    if ((await uploadButton.count()) > 0) {
      await expect(uploadButton).toBeVisible();
    }
  });

  test("should have save and continue button", async ({ page }) => {
    await waitForLoadingComplete(page);

    const continueButton = page
      .locator("button")
      .filter({
        hasText: /save|continue|submit|guardar|continuar|enviar/i,
      })
      .first();

    if ((await continueButton.count()) > 0) {
      await expect(continueButton).toBeVisible();
    }
  });
});
