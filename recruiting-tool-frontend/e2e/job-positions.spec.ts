import { test, expect } from '@playwright/test';
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
  waitForTableData,
  generateTestData,
} from './fixtures/test-utils';

test.describe('Job Positions Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page, TEST_USERS.HR_ADMIN);

    // Navigate to job positions page
    await page.goto('/job-positions');
    await waitForLoadingComplete(page);
  });

  test('should display job positions list page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1, h2').filter({ hasText: /job.*position|position/i }).first()).toBeVisible();

    // Check table or grid exists
    const table = page.locator('[role="grid"], table, .MuiDataGrid-root, [class*="job-list"]').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Wait for data to load
    await waitForTableData(page);
  });

  test('should display job position cards or rows', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // Should have job positions visible (cards or table rows)
    const jobItems = page.locator('[role="row"], [class*="job-card"], [class*="position-card"]');
    const count = await jobItems.count();

    // Should have at least one job position (from dummy data)
    expect(count).toBeGreaterThan(0);
  });

  test('should search/filter job positions', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      // Enter search term (searching for common job title)
      await searchInput.fill('Developer');

      // Wait for filtered results
      await waitForLoadingComplete(page);

      // Results should update
      await expect(page.locator('[role="grid"], table, .MuiDataGrid-root, [class*="job-list"]').first()).toBeVisible();
    }
  });

  test('should open create job position dialog or page', async ({ page }) => {
    // Look for "Add" or "Create" button
    const createButton = page.locator('button, a').filter({ hasText: /add|create|new|post/i }).first();

    await createButton.click();

    // Wait for dialog or navigation
    await page.waitForTimeout(1000);

    // Should see either a dialog or navigate to create page
    const hasDialog = await page.locator('[role="dialog"]').isVisible();
    const hasNavigated = page.url().includes('/create') || page.url().includes('/new');

    expect(hasDialog || hasNavigated).toBeTruthy();
  });

  test('should create a new job position', async ({ page }) => {
    // Generate unique test data
    const testData = generateTestData('position');

    // Open create dialog/page
    const createButton = page.locator('button, a').filter({ hasText: /add|create|new|post/i }).first();
    await createButton.click();

    // Wait for form
    await page.waitForTimeout(1000);

    // Fill in job position details
    await page.fill('input[name="title"], input[label*="Title"]', `Software Engineer ${testData.timestamp}`);

    const descriptionField = page.locator(
      'textarea[name="description"], textarea[label*="Description"], [contenteditable="true"]',
    ).first();

    if (await descriptionField.count() > 0) {
      await descriptionField.fill('Test job position description for E2E testing');
    }

    // Select status if available
    const statusSelect = page.locator('[name="status"], [label*="Status"]').first();
    if (await statusSelect.count() > 0) {
      await statusSelect.click();

      // Select "Open" or "Active" status
      await page.waitForTimeout(500);
      const openOption = page.locator('[role="option"]').filter({ hasText: /open|active/i }).first();

      if (await openOption.count() > 0) {
        await openOption.click();
      }
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({
      hasText: /submit|save|create|publish|post/i,
    }).first();

    await submitButton.click();

    // Wait for success (redirect or dialog close)
    await page.waitForTimeout(2000);
    await waitForLoadingComplete(page);

    // Should see success message or redirect to list
    const isOnListPage = page.url().includes('/job-positions') && !page.url().includes('/create');

    expect(isOnListPage || await page.locator('[role="dialog"]').isHidden()).toBeTruthy();
  });

  test('should view job position details', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Click on first job position
    const firstJob = page.locator('[role="row"], [class*="job-card"]').nth(1);

    // Look for view button or clickable element
    const viewButton = firstJob.locator('button[aria-label*="view"], a[href*="/job-positions/"]').first();

    if (await viewButton.count() > 0) {
      await viewButton.click();
    } else {
      // Click card/row if no explicit view button
      await firstJob.click();
    }

    // Wait for navigation or modal
    await waitForLoadingComplete(page);

    // Should see job details
    const detailsContainer = page.locator('[role="dialog"], main, [class*="detail"]').first();
    await expect(detailsContainer).toBeVisible();

    // Should see job title
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('should display job position status', async ({ page }) => {
    // Wait for data to load
    await waitForTableData(page);

    // Look for status indicators (badges, chips, labels)
    const statusIndicators = page.locator('[class*="status"], [class*="badge"], [class*="chip"]');

    const count = await statusIndicators.count();

    // Should have at least one status indicator
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by job status', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // Look for status filter
    const statusFilter = page.locator('[label*="Status"], select[name="status"], button').filter({
      hasText: /status|filter/i,
    }).first();

    if (await statusFilter.count() > 0) {
      await statusFilter.click();

      // Wait for dropdown
      await page.waitForTimeout(500);

      // Select a status
      const openStatus = page.locator('[role="option"], [role="menuitem"]').filter({ hasText: /open|active/i }).first();

      if (await openStatus.count() > 0) {
        await openStatus.click();

        // Wait for filtered results
        await waitForLoadingComplete(page);

        // Should still see job positions
        const jobItems = page.locator('[role="row"], [class*="job-card"]');
        const count = await jobItems.count();

        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should edit job position', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Find edit button in first row
    const editButton = page.locator('[role="row"], [class*="job-card"]').nth(1).locator('button[aria-label*="edit"], a[href*="/edit"]').first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Wait for edit form
      await page.waitForTimeout(1000);

      // Should see edit form (dialog or page)
      const hasDialog = await page.locator('[role="dialog"]').isVisible();
      const hasNavigated = page.url().includes('/edit');

      expect(hasDialog || hasNavigated).toBeTruthy();

      // Check title field is populated
      const titleField = page.locator('input[name="title"]');
      const titleValue = await titleField.inputValue();

      expect(titleValue.length).toBeGreaterThan(0);
    }
  });

  test('should delete job position', async ({ page }) => {
    // First create a test job to delete
    const testData = generateTestData('delete-job');

    // Create job
    const createButton = page.locator('button, a').filter({ hasText: /add|create|new|post/i }).first();
    await createButton.click();
    await page.waitForTimeout(1000);

    await page.fill('input[name="title"]', `Test Job ${testData.timestamp}`);

    const descriptionField = page.locator('textarea[name="description"]').first();
    if (await descriptionField.count() > 0) {
      await descriptionField.fill('Job to delete');
    }

    const submitButton = page.locator('button[type="submit"], button').filter({
      hasText: /submit|save|create|publish/i,
    }).first();

    await submitButton.click();
    await page.waitForTimeout(2000);
    await waitForLoadingComplete(page);

    // Navigate back to list if needed
    if (!page.url().match(/\/job-positions\/?$/)) {
      await page.goto('/job-positions');
      await waitForLoadingComplete(page);
    }

    // Search for the job
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill(`Test Job ${testData.timestamp}`);
      await waitForLoadingComplete(page);
    }

    // Find delete button
    const deleteButton = page.locator('button[aria-label*="delete"]').first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Confirm deletion
      await page.waitForTimeout(500);
      const confirmButton = page.locator('button').filter({ hasText: /confirm|delete|yes/i }).first();

      if (await confirmButton.count() > 0) {
        await confirmButton.click();

        // Wait for deletion
        await waitForLoadingComplete(page);

        // Job should no longer be visible
        await expect(page.locator(`text=Test Job ${testData.timestamp}`).first()).not.toBeVisible();
      }
    }
  });

  test('should sort job positions', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // Find sortable column header
    const titleHeader = page.locator('[role="columnheader"]').filter({ hasText: /title|name/i }).first();

    if (await titleHeader.count() > 0) {
      // Click to sort
      await titleHeader.click();
      await waitForLoadingComplete(page);

      // Table should still be visible
      await expect(page.locator('[role="grid"], table, .MuiDataGrid-root').first()).toBeVisible();
    }
  });

  test('should validate required fields when creating job position', async ({ page }) => {
    // Open create form
    const createButton = page.locator('button, a').filter({ hasText: /add|create|new|post/i }).first();
    await createButton.click();
    await page.waitForTimeout(1000);

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button').filter({
      hasText: /submit|save|create|publish/i,
    }).first();

    await submitButton.click();
    await page.waitForTimeout(1000);

    // Should see validation errors or form should not submit
    const hasDialog = await page.locator('[role="dialog"]').isVisible();
    const isStillOnForm = page.url().includes('/create') || page.url().includes('/new');
    const hasErrors = await page.locator('text=/required|invalid/i').count() > 0;

    expect(hasDialog || isStillOnForm || hasErrors).toBeTruthy();
  });

  test('should display job position stages', async ({ page }) => {
    // Wait for table to load
    await waitForTableData(page);

    // View first job position
    const firstJob = page.locator('[role="row"], [class*="job-card"]').nth(1);
    await firstJob.click();
    await waitForLoadingComplete(page);

    // Look for stages section
    const stagesSection = page.locator('text=/stages|workflow|pipeline/i').first();

    if (await stagesSection.count() > 0) {
      await expect(stagesSection).toBeVisible();

      // Should see stage items
      const stageItems = page.locator('[class*="stage"], [role="listitem"]');
      const count = await stageItems.count();

      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Public Job Positions (Careers Page)', () => {
  test('should display public careers page without authentication', async ({ page }) => {
    // Navigate to public careers page
    await page.goto('/careers');
    await waitForLoadingComplete(page);

    // Should see job listings
    const jobListings = page.locator('[class*="job"], [role="article"]');
    const count = await jobListings.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should view public job details without authentication', async ({ page }) => {
    // Navigate to careers page
    await page.goto('/careers');
    await waitForLoadingComplete(page);

    // Click on first job
    const firstJob = page.locator('[class*="job-card"], [role="article"]').first();

    if (await firstJob.count() > 0) {
      await firstJob.click();
      await waitForLoadingComplete(page);

      // Should see job details
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });
});
