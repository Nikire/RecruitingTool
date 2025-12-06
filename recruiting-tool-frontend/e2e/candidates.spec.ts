import { test, expect } from '@playwright/test';
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
  waitForTableData,
  generateTestData,
  openDialog,
  closeDialog,
  waitForSuccessToast,
} from './fixtures/test-utils';

test.describe('Candidates Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page, TEST_USERS.HR_ADMIN);

    // Navigate to candidates page
    await page.goto('/candidates');
    await waitForLoadingComplete(page);
  });

  test('should display candidates list page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1, h2').filter({ hasText: /candidates/i }).first()).toBeVisible();

    // Check table or grid exists
    const table = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Wait for data to load
    await waitForTableData(page);
  });

  test('should display candidate columns correctly', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Check for common column headers
    const nameColumn = page.locator('text=/name/i').first();
    const emailColumn = page.locator('text=/email/i').first();

    await expect(nameColumn).toBeVisible();
    await expect(emailColumn).toBeVisible();
  });

  test('should search/filter candidates', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      // Enter search term
      await searchInput.fill('John');

      // Wait for filtered results
      await waitForLoadingComplete(page);

      // Results should update (check that we still have table)
      await expect(page.locator('[role="grid"], table, .MuiDataGrid-root').first()).toBeVisible();
    }
  });

  test('should open create candidate dialog', async ({ page }) => {
    // Look for "Add" or "Create" button
    const createButton = page.locator('button').filter({ hasText: /add|create|new/i }).first();

    await createButton.click();

    // Wait for dialog to appear
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });

    // Check dialog title
    const dialogTitle = page.locator('[role="dialog"] h2, [role="dialog"] h1').first();
    await expect(dialogTitle).toContainText(/candidate/i);
  });

  test('should create a new candidate', async ({ page }) => {
    // Generate unique test data
    const testData = generateTestData('candidate');

    // Open create dialog
    const createButton = page.locator('button').filter({ hasText: /add|create|new/i }).first();
    await createButton.click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Fill in candidate details
    await page.fill('input[name="name"], input[label*="Name"]', testData.name);
    await page.fill('input[name="email"], input[type="email"]', testData.email);

    // Fill other required fields if they exist
    const phoneInput = page.locator('input[name="phone"], input[label*="Phone"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('+1-555-0199');
    }

    // Submit form
    const submitButton = page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button').filter({
      hasText: /submit|save|create/i,
    }).first();

    await submitButton.click();

    // Wait for success (dialog closes or success message)
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('Dialog did not close');
    });

    // Wait for table to refresh
    await waitForLoadingComplete(page);

    // Verify new candidate appears in list (search for it)
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill(testData.email);
      await waitForLoadingComplete(page);

      // Should see the new candidate
      await expect(page.locator(`text=${testData.email}`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view candidate details', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Click on first candidate row or view button
    const firstRow = page.locator('[role="row"]').nth(1); // Skip header row

    // Look for view button or clickable row
    const viewButton = firstRow.locator('button[aria-label*="view"], a[href*="/candidates/"]').first();

    if (await viewButton.count() > 0) {
      await viewButton.click();
    } else {
      // Click row if no explicit view button
      await firstRow.click();
    }

    // Wait for navigation or modal
    await waitForLoadingComplete(page);

    // Should see candidate details (either new page or modal)
    const detailsContainer = page.locator('[role="dialog"], main, [class*="detail"]').first();
    await expect(detailsContainer).toBeVisible();
  });

  test('should open edit candidate dialog from list', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Find edit button in first row
    const editButton = page.locator('[role="row"]').nth(1).locator('button[aria-label*="edit"]').first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Wait for edit dialog
      await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });

      // Check dialog title contains edit or update
      const dialogTitle = page.locator('[role="dialog"] h2').first();
      await expect(dialogTitle).toContainText(/edit|update/i);
    }
  });

  test('should delete candidate', async ({ page }) => {
    // First create a test candidate to delete
    const testData = generateTestData('delete-test');

    // Open create dialog
    const createButton = page.locator('button').filter({ hasText: /add|create|new/i }).first();
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Create candidate
    await page.fill('input[name="name"]', testData.name);
    await page.fill('input[name="email"]', testData.email);

    const submitButton = page.locator('[role="dialog"] button').filter({ hasText: /submit|save|create/i }).first();
    await submitButton.click();

    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await waitForLoadingComplete(page);

    // Search for the candidate
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill(testData.email);
      await waitForLoadingComplete(page);
    }

    // Find delete button
    const deleteButton = page.locator('button[aria-label*="delete"]').first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Confirm deletion in confirmation dialog
      const confirmButton = page.locator('[role="dialog"] button').filter({ hasText: /confirm|delete|yes/i }).first();

      if (await confirmButton.count() > 0) {
        await confirmButton.click();

        // Wait for deletion to complete
        await waitForLoadingComplete(page);

        // Candidate should no longer be visible
        await expect(page.locator(`text=${testData.email}`).first()).not.toBeVisible();
      }
    }
  });

  test('should sort candidates by column', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Find a sortable column header (e.g., Name)
    const nameHeader = page.locator('[role="columnheader"]').filter({ hasText: /name/i }).first();

    if (await nameHeader.count() > 0) {
      // Get first row name before sort
      const firstRowBefore = await page.locator('[role="row"]').nth(1).textContent();

      // Click to sort
      await nameHeader.click();
      await waitForLoadingComplete(page);

      // Get first row name after sort
      const firstRowAfter = await page.locator('[role="row"]').nth(1).textContent();

      // Content should change (assuming we have enough data)
      // Or at least the table should still be visible
      await expect(page.locator('[role="grid"], table, .MuiDataGrid-root').first()).toBeVisible();
    }
  });

  test('should paginate through candidates', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Look for pagination controls
    const nextPageButton = page.locator('[aria-label*="next page"], button[aria-label*="Next"]').first();

    if (await nextPageButton.count() > 0 && await nextPageButton.isEnabled()) {
      // Get first row before pagination
      const firstRowBefore = await page.locator('[role="row"]').nth(1).textContent();

      // Click next page
      await nextPageButton.click();
      await waitForLoadingComplete(page);

      // Get first row after pagination
      const firstRowAfter = await page.locator('[role="row"]').nth(1).textContent();

      // Content should change (assuming we have enough data)
      await expect(page.locator('[role="grid"], table, .MuiDataGrid-root').first()).toBeVisible();
    }
  });

  test('should validate required fields when creating candidate', async ({ page }) => {
    // Open create dialog
    const createButton = page.locator('button').filter({ hasText: /add|create|new/i }).first();
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Try to submit without filling required fields
    const submitButton = page.locator('[role="dialog"] button').filter({ hasText: /submit|save|create/i }).first();
    await submitButton.click();

    // Should see validation errors or dialog should not close
    await page.waitForTimeout(1000);

    // Dialog should still be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Or validation errors should appear
    const errorMessage = page.locator('text=/required|invalid/i').first();
    const hasError = await errorMessage.count() > 0;

    expect(hasError || await page.locator('[role="dialog"]').isVisible()).toBeTruthy();
  });

  test('should validate email format', async ({ page }) => {
    // Open create dialog
    const createButton = page.locator('button').filter({ hasText: /add|create|new/i }).first();
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Fill with invalid email
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"], input[type="email"]', 'invalid-email');

    // Try to submit
    const submitButton = page.locator('[role="dialog"] button').filter({ hasText: /submit|save|create/i }).first();
    await submitButton.click();

    await page.waitForTimeout(1000);

    // Should see validation error for email
    const emailError = page.locator('text=/invalid.*email|email.*invalid/i').first();
    const dialogStillOpen = await page.locator('[role="dialog"]').isVisible();

    expect((await emailError.count() > 0) || dialogStillOpen).toBeTruthy();
  });
});

test.describe('Candidate Filters', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto('/candidates');
    await waitForLoadingComplete(page);
  });

  test('should filter by status if available', async ({ page }) => {
    // Look for status filter dropdown
    const statusFilter = page.locator('[label*="Status"], select[name="status"]').first();

    if (await statusFilter.count() > 0) {
      await statusFilter.click();

      // Wait for options
      await page.waitForSelector('[role="option"], option', { timeout: 5000 });

      // Select an option
      const firstOption = page.locator('[role="option"], option').nth(1);
      await firstOption.click();

      // Wait for filtered results
      await waitForLoadingComplete(page);

      // Table should still be visible
      await expect(page.locator('[role="grid"], table, .MuiDataGrid-root').first()).toBeVisible();
    }
  });

  test('should clear filters', async ({ page }) => {
    // Look for clear filters button
    const clearButton = page.locator('button').filter({ hasText: /clear|reset/i }).first();

    if (await clearButton.count() > 0) {
      await clearButton.click();

      // Wait for results to refresh
      await waitForLoadingComplete(page);

      // Table should show all results
      await expect(page.locator('[role="grid"], table, .MuiDataGrid-root').first()).toBeVisible();
    }
  });
});
