import { Page, expect } from '@playwright/test';

/**
 * Test User Credentials
 * These users are seeded from dummy data
 */
export const TEST_USERS = {
  HR_ADMIN: {
    email: 'alice@techinnovations.com',
    password: 'password123',
    name: 'Alice Johnson',
    roles: ['USER', 'HR', 'ADMIN'],
  },
  HR_SPECIALIST: {
    email: 'bob@techinnovations.com',
    password: 'password123',
    name: 'Bob Smith',
    roles: ['USER', 'HR'],
  },
  HR_MANAGER: {
    email: 'charlie@digitalsolutions.com',
    password: 'password123',
    name: 'Charlie Brown',
    roles: ['USER', 'HR', 'ADMIN'],
  },
};

/**
 * Login helper function
 * Logs in a user and waits for the dashboard to load
 */
export async function login(
  page: Page,
  credentials: { email: string; password: string } = TEST_USERS.HR_ADMIN,
): Promise<void> {
  // Navigate to login page
  await page.goto('/login');

  // Wait for login form to be visible
  await page.waitForSelector('form', { state: 'visible', timeout: 5000 });

  // Fill in credentials - using label selectors since react-hook-form doesn't add name attribute
  const emailInput = page.locator('input').filter({ has: page.locator('text=/email/i') }).or(
    page.locator('label:has-text("Email"), label:has-text("Correo")').locator('~ div input')
  ).first();
  await emailInput.fill(credentials.email);

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(credentials.password);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard, home, hr, or admin page
  await page.waitForURL(/\/(dashboard|home|admin|hr)/, { timeout: 30000 });

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle', { timeout: 30000 });
}

/**
 * Logout helper function
 * Logs out the current user
 */
export async function logout(page: Page): Promise<void> {
  // Look for profile/settings link in drawer
  const profileLink = page.locator('a[href="/settings/profile"], a[href*="profile"]').first();

  if (await profileLink.count() > 0) {
    await profileLink.click();
    await page.waitForLoadState('networkidle');

    // Look for logout button on profile page
    const logoutButton = page.locator('button, a').filter({ hasText: /logout|cerrar sesión/i }).first();
    if (await logoutButton.count() > 0) {
      await logoutButton.click();

      // Wait for redirect to login page
      await page.waitForURL(/login/, { timeout: 10000 });
      return;
    }
  }

  // Alternative: clear storage and navigate
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for loading indicators to disappear
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  // Wait for common loading indicators to disappear
  await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {
    // Loading indicator may not exist
  });

  await page.waitForLoadState('networkidle', { timeout: 30000 });
}

/**
 * Fill form field by label
 */
export async function fillFormField(page: Page, label: string, value: string): Promise<void> {
  // Find input by label
  const input = page.locator(`label:has-text("${label}") + input, label:has-text("${label}") + textarea`).first();
  await input.fill(value);
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, buttonText: string): Promise<void> {
  await page.click(`button:has-text("${buttonText}")`);
}

/**
 * Wait for success toast notification
 */
export async function waitForSuccessToast(page: Page, message?: string): Promise<void> {
  if (message) {
    await expect(page.locator(`[role="status"]:has-text("${message}")`).first()).toBeVisible({ timeout: 5000 });
  } else {
    await expect(page.locator('[role="status"]').first()).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Wait for error toast notification
 */
export async function waitForErrorToast(page: Page, message?: string): Promise<void> {
  if (message) {
    await expect(page.locator(`[role="alert"]:has-text("${message}")`).first()).toBeVisible({ timeout: 5000 });
  } else {
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Navigate to a specific section
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForLoadingComplete(page);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check if we're on login page (not authenticated)
    const url = page.url();
    if (url.includes('/login')) {
      return false;
    }

    // Check for user avatar or app bar (signs of authenticated UI)
    await page.waitForSelector('.MuiAvatar-root, [role="banner"], .MuiAppBar-root', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique test data
 */
export function generateTestData(prefix: string): {
  email: string;
  name: string;
  timestamp: number;
} {
  const timestamp = Date.now();
  return {
    email: `${prefix}.${timestamp}@test.com`,
    name: `${prefix} Test ${timestamp}`,
    timestamp,
  };
}

/**
 * Wait for table to load with data
 */
export async function waitForTableData(page: Page): Promise<void> {
  // Wait for loading to complete first
  await waitForLoadingComplete(page);

  // Wait for either data grid, table, or card layout (mobile view)
  await page.waitForSelector('[role="grid"], table, .MuiDataGrid-root, [class*="MuiCard"], [class*="job-card"]', {
    timeout: 15000
  }).catch(async () => {
    // If no data structure appears, check if there's a "no data" message
    const noDataMessage = await page.locator('text=/no.*candidates|no.*jobs|no.*positions|no.*data/i').count();
    if (noDataMessage === 0) {
      throw new Error('No table, grid, or data display found');
    }
  });

  // Wait a bit for data to populate
  await page.waitForTimeout(500);
}

/**
 * Open dialog/modal by clicking button
 * If a menu appears, selects the first option (for "Create" buttons with dropdown menus)
 */
export async function openDialog(page: Page, buttonText: string): Promise<void> {
  await clickButton(page, buttonText);

  // Wait a moment to see if a menu appears
  await page.waitForTimeout(300);

  // Check if a menu appeared (MUI Menu)
  const menu = page.locator('[role="menu"]');
  if (await menu.isVisible()) {
    // Click the first menu item (typically "Create Manual" or similar)
    const firstMenuItem = menu.locator('[role="menuitem"]').filter({ hasText: /manual|create/i }).first();
    if (await firstMenuItem.count() > 0) {
      await firstMenuItem.click();
    } else {
      // Fallback: click any first menu item
      await menu.locator('[role="menuitem"]').first().click();
    }
  }

  // Wait for MUI dialog to be visible (not the drawer)
  await page.waitForSelector('.MuiDialog-paper', { state: 'visible', timeout: 5000 });
}

/**
 * Close dialog/modal
 */
export async function closeDialog(page: Page): Promise<void> {
  // Try close button first
  await page.click('[aria-label="Close"], [aria-label="close"]', { timeout: 3000 }).catch(() => {
    // Fallback: click cancel button
    return page.click('button:has-text("Cancel")');
  });

  // Wait for MUI dialog to be hidden (not the drawer)
  await page.waitForSelector('.MuiDialog-paper', { state: 'hidden', timeout: 5000 });
}

/**
 * Select dropdown option
 */
export async function selectOption(page: Page, label: string, optionText: string): Promise<void> {
  // Click dropdown
  await page.click(`label:has-text("${label}") + div [role="button"]`);

  // Wait for dropdown menu
  await page.waitForSelector('[role="listbox"], [role="menu"]', { state: 'visible' });

  // Click option
  await page.click(`[role="option"]:has-text("${optionText}"), [role="menuitem"]:has-text("${optionText}")`);
}
