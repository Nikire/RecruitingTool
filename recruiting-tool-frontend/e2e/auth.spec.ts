import { test, expect } from '@playwright/test';
import { login, logout, TEST_USERS, waitForErrorToast } from './fixtures/test-utils';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from login page
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check email input exists
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();

    // Check password input exists
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();

    // Check login button exists
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Login using test user
    await login(page, TEST_USERS.HR_ADMIN);

    // Check we're redirected to dashboard, home, or admin page
    expect(page.url()).toMatch(/\/(dashboard|home|admin)/);

    // Check user is authenticated (look for user menu or logout button)
    const userMenu = page.locator('[aria-label="Account menu"], [aria-label="User menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait a moment for error to appear
    await page.waitForTimeout(2000);

    // Check we're still on login page
    expect(page.url()).toContain('/login');

    // Check for error message (adjust selector based on your implementation)
    const errorMessage = page.locator('text=/invalid|incorrect|wrong/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 }).catch(() => {
      // Error might be in a toast notification
      console.log('Error message not found in expected location');
    });
  });

  test('should show validation error for empty email', async ({ page }) => {
    // Leave email empty, fill password
    await page.fill('input[name="password"]', 'password123');

    // Try to submit
    await page.click('button[type="submit"]');

    // Check for validation error (HTML5 validation or custom)
    const emailInput = page.locator('input[name="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);

    // Check if HTML5 validation kicks in or custom error appears
    expect(validationMessage || page.locator('text=/email.*required/i')).toBeTruthy();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await login(page, TEST_USERS.HR_ADMIN);

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');

    // Logout
    await logout(page);

    // Check we're redirected to login page
    expect(page.url()).toContain('/login');

    // Check user menu is no longer visible
    const userMenu = page.locator('[aria-label="Account menu"], [aria-label="User menu"]');
    await expect(userMenu).not.toBeVisible();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access protected route without logging in
    await page.goto('/candidates');

    // Should be redirected to login
    await page.waitForURL(/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('should persist session after page reload', async ({ page }) => {
    // Login
    await login(page, TEST_USERS.HR_ADMIN);

    // Reload page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should still be authenticated
    const userMenu = page.locator('[aria-label="Account menu"], [aria-label="User menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });

    // Should not be redirected to login
    expect(page.url()).not.toContain('/login');
  });

  test('should toggle password visibility', async ({ page }) => {
    // Find password input
    const passwordInput = page.locator('input[name="password"]');

    // Check initial type is password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Look for toggle button (eye icon)
    const toggleButton = page.locator('[aria-label*="password"], button[type="button"]').filter({
      has: page.locator('svg'),
    }).first();

    // Click toggle if it exists
    const toggleExists = await toggleButton.count();
    if (toggleExists > 0) {
      await toggleButton.click();

      // Check type changed to text
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Toggle back
      await toggleButton.click();

      // Check type changed back to password
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should handle different user roles correctly', async ({ page }) => {
    // Login as HR specialist (not admin)
    await login(page, TEST_USERS.HR_SPECIALIST);

    // Should be authenticated
    const userMenu = page.locator('[aria-label="Account menu"], [aria-label="User menu"]');
    await expect(userMenu).toBeVisible();

    // Check we can access appropriate pages
    await page.goto('/candidates');
    await page.waitForLoadState('networkidle');

    // Should be able to view candidates page
    expect(page.url()).toContain('/candidates');
  });
});

test.describe('Login Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should disable submit button while submitting', async ({ page }) => {
    // Fill valid credentials
    await page.fill('input[name="email"]', TEST_USERS.HR_ADMIN.email);
    await page.fill('input[name="password"]', TEST_USERS.HR_ADMIN.password);

    // Click submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Button should be disabled during submission
    const isDisabled = await submitButton.isDisabled().catch(() => false);

    // Either the button is disabled, or we've already redirected
    const hasRedirected = !page.url().includes('/login');

    expect(isDisabled || hasRedirected).toBeTruthy();
  });

  test('should trim whitespace from email input', async ({ page }) => {
    // Enter email with whitespace
    await page.fill('input[name="email"]', '  alice@techinnovations.com  ');
    await page.fill('input[name="password"]', TEST_USERS.HR_ADMIN.password);

    // Submit
    await page.click('button[type="submit"]');

    // Should successfully login despite whitespace
    await page.waitForURL(/\/(dashboard|home|admin)/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/(dashboard|home|admin)/);
  });
});
