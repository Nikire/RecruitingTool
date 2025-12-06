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

  // Fill in credentials
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard, home, or admin page
  await page.waitForURL(/\/(dashboard|home|admin)/, { timeout: 10000 });

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
}

/**
 * Logout helper function
 * Logs out the current user
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu or logout button
  // Adjust selector based on your actual logout implementation
  await page.click('[aria-label="Account menu"]', { timeout: 5000 }).catch(() => {
    // Fallback: try direct logout link
    return page.click('a[href="/logout"]');
  });

  // Click logout option
  await page.click('text=Logout', { timeout: 5000 });

  // Wait for redirect to login page
  await page.waitForURL('/login', { timeout: 10000 });
}

/**
 * Wait for loading indicators to disappear
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  // Wait for common loading indicators to disappear
  await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {
    // Loading indicator may not exist
  });

  await page.waitForLoadState('networkidle');
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

    // Check for user menu or authenticated UI element
    await page.waitForSelector('[aria-label="Account menu"]', { timeout: 3000 });
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
  // Wait for table or data grid to be visible
  await page.waitForSelector('[role="grid"], table, .MuiDataGrid-root', { timeout: 10000 });

  // Wait for loading to complete
  await waitForLoadingComplete(page);

  // Wait for at least one row to be visible
  await page.waitForSelector('[role="row"]:not([role="row"]:has-text("No data"))', { timeout: 5000 });
}

/**
 * Open dialog/modal by clicking button
 */
export async function openDialog(page: Page, buttonText: string): Promise<void> {
  await clickButton(page, buttonText);

  // Wait for dialog to be visible
  await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });
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

  // Wait for dialog to be hidden
  await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
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
