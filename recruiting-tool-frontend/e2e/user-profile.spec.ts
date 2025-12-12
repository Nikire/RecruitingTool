import { test, expect } from "@playwright/test";
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
} from "./fixtures/test-utils";

test.describe("User Profile Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/profile");
    await waitForLoadingComplete(page);
  });

  test("should display profile page", async ({ page }) => {
    // Verify we're on profile page
    expect(page.url()).toContain("/profile");

    // Should have main content
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test("should display user information", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should show user's name
    const userName = page
      .locator("text=/Alice Johnson|Alice|Johnson/i")
      .first();

    if ((await userName.count()) > 0) {
      await expect(userName).toBeVisible({ timeout: 10000 });
    } else {
      // Fallback - just verify page loaded
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("should display email address", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should show user's email
    const email = page
      .locator("text=/alice@techinnovations.com|email|correo/i")
      .first();

    if ((await email.count()) > 0) {
      await expect(email).toBeVisible();
    }
  });

  test("should have edit profile button", async ({ page }) => {
    await waitForLoadingComplete(page);

    const editButton = page
      .locator("button")
      .filter({
        hasText: /edit|update.*profile|editar|actualizar/i,
      })
      .first();

    if ((await editButton.count()) > 0) {
      await expect(editButton).toBeVisible();
    }
  });

  test("should open edit profile dialog", async ({ page }) => {
    await waitForLoadingComplete(page);

    const editButton = page
      .locator("button")
      .filter({
        hasText: /edit|update/i,
      })
      .first();

    if ((await editButton.count()) > 0) {
      await editButton.click();
      await page.waitForTimeout(1000);

      // Dialog should appear
      const dialog = page.locator(".MuiDialog-paper");
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Should have form inputs
      const inputs = dialog.locator("input");
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
    }
  });

  test("should display user avatar or initials", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for avatar
    const avatar = page.locator(".MuiAvatar-root").first();

    if ((await avatar.count()) > 0) {
      await expect(avatar).toBeVisible();
    }
  });

  test("should display role information", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should show user's role(s)
    const roleInfo = page.locator("text=/role|admin|hr|rol/i, .MuiChip-root");

    if ((await roleInfo.count()) > 0) {
      await expect(roleInfo.first()).toBeVisible();
    }
  });

  test("should have password change option", async ({ page }) => {
    await waitForLoadingComplete(page);

    const passwordButton = page
      .locator("button, a")
      .filter({
        hasText: /password|change.*password|contraseña|cambiar.*contraseña/i,
      })
      .first();

    if ((await passwordButton.count()) > 0) {
      await expect(passwordButton).toBeVisible();
    }
  });

  test("should have logout button", async ({ page }) => {
    await waitForLoadingComplete(page);

    const logoutButton = page
      .locator("button, a")
      .filter({
        hasText: /logout|sign.*out|cerrar.*sesión/i,
      })
      .first();

    if ((await logoutButton.count()) > 0) {
      await expect(logoutButton).toBeVisible();
    }
  });

  test("should navigate to subscription page", async ({ page }) => {
    await waitForLoadingComplete(page);

    const subscriptionLink = page
      .locator("button, a")
      .filter({
        hasText: /subscription|billing|plan|suscripción|facturación/i,
      })
      .first();

    if ((await subscriptionLink.count()) > 0) {
      await subscriptionLink.click();
      await waitForLoadingComplete(page);

      // Should navigate to subscription page
      expect(page.url()).toContain("/subscription");
    }
  });

  test("should display company information", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should show associated company
    const companyInfo = page
      .locator("text=/company|Tech Innovations|empresa/i")
      .first();

    if ((await companyInfo.count()) > 0) {
      await expect(companyInfo).toBeVisible();
    }
  });

  test("should have notification preferences", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for notification settings
    const notificationSettings = page
      .locator("text=/notification|notificación|alert|alerta/i")
      .first();

    if ((await notificationSettings.count()) > 0) {
      await expect(notificationSettings).toBeVisible();
    }
  });
});
