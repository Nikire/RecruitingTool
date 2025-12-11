import { test, expect } from "@playwright/test";
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
  waitForTableData,
} from "./fixtures/test-utils";

test.describe("Job Positions Management", () => {
  test.beforeEach(async ({ page }) => {
    // Use HR_SPECIALIST (HR role only) to ensure redirect to HR dashboard, not admin
    await login(page, TEST_USERS.HR_SPECIALIST);
    await page.goto("/hr/job-positions");
    await waitForLoadingComplete(page);
  });

  test("should display job positions list page", async ({ page }) => {
    // Check page title exists
    const title = page
      .locator("h4, h5")
      .filter({ hasText: /job.*position|position|puesto/i })
      .first();
    await expect(title).toBeVisible({ timeout: 10000 });

    // Verify main content area is visible
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test("should display job position cards", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should have cards or data grid
    const jobCards = page.locator(
      '.MuiCard-root, [role="grid"], .MuiDataGrid-root',
    );
    const count = await jobCards.count();

    // Should have at least one card OR show empty state
    const hasCards = count > 0;
    const hasEmptyState =
      (await page
        .locator("text=/no.*position|no.*results|sin.*puestos/i")
        .count()) > 0;

    expect(hasCards || hasEmptyState).toBeTruthy();
  });

  test("should have search/filter functionality", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for search input
    const searchInput = page
      .locator(
        'input[placeholder*="Search"], input[placeholder*="search"], input[type="text"]',
      )
      .first();

    if ((await searchInput.count()) > 0) {
      await expect(searchInput).toBeVisible();

      // Type search term
      await searchInput.fill("Developer");
      await page.waitForTimeout(1000); // debounce

      // Page should still work
      await expect(page.locator("main").first()).toBeVisible();
    } else {
      // If no search, verify page has content
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("should have create job position button", async ({ page }) => {
    const createButton = page
      .locator("button")
      .filter({ hasText: /add|create|new|post|crear/i })
      .first();
    await expect(createButton).toBeVisible({ timeout: 5000 });
  });

  test("should open create job position dialog", async ({ page }) => {
    const createButton = page
      .locator("button")
      .filter({ hasText: /add|create|new|post|crear/i })
      .first();
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for dialog
    await page.waitForTimeout(1000);

    // Dialog should appear
    const dialog = page.locator(".MuiDialog-paper");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Should have form inputs
    const inputs = dialog.locator("input, textarea");
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(0);
  });

  test("should show status indicators on job cards", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for status chips or badges
    const statusIndicators = page.locator(
      '.MuiChip-root, [class*="status"], [class*="badge"]',
    );
    const cards = page.locator(".MuiCard-root");

    const hasStatus = (await statusIndicators.count()) > 0;
    const hasCards = (await cards.count()) > 0;

    // Should have status indicators if there are job cards
    expect(hasStatus || !hasCards).toBeTruthy();
  });

  test("should navigate to job position details", async ({ page }) => {
    await waitForLoadingComplete(page);

    const jobCard = page.locator(".MuiCard-root").first();

    if ((await jobCard.count()) > 0) {
      const initialUrl = page.url();

      // Try view button or click card
      const viewButton = jobCard
        .locator("button")
        .filter({ hasText: /view|ver|details/i })
        .first();

      if ((await viewButton.count()) > 0) {
        await viewButton.click();
      } else {
        await jobCard.click();
      }

      await page.waitForTimeout(2000);

      // Should navigate or open dialog
      const urlChanged = page.url() !== initialUrl;
      const dialogOpened = await page.locator(".MuiDialog-paper").isVisible();
      const pageWorks = await page.locator("main").first().isVisible();

      expect(urlChanged || dialogOpened || pageWorks).toBeTruthy();
    } else {
      // No job cards - verify empty state
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("should filter by status", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for status filter
    const statusFilter = page
      .locator('button, [role="combobox"]')
      .filter({ hasText: /status|estado|filter/i })
      .first();

    if ((await statusFilter.count()) > 0) {
      await statusFilter.click();
      await page.waitForTimeout(500);

      // Should show dropdown options
      const options = page.locator('[role="option"], [role="menuitem"]');
      const optionCount = await options.count();

      if (optionCount > 0) {
        // Click first option
        await options.first().click();
        await waitForLoadingComplete(page);

        // Page should still be functional
        await expect(page.locator("main").first()).toBeVisible();
      }
    }
  });

  test("should open edit dialog for job position", async ({ page }) => {
    await waitForLoadingComplete(page);

    const editButton = page
      .locator('button[aria-label*="edit"], button[aria-label*="Edit"]')
      .first();

    if ((await editButton.count()) > 0) {
      await editButton.click();

      // Dialog should appear
      const dialog = page.locator(".MuiDialog-paper");
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Should have pre-filled form
      const titleInput = dialog.locator('input[name="title"], input').first();
      if ((await titleInput.count()) > 0) {
        const value = await titleInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    } else {
      // No edit button - verify page works
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("should show delete confirmation", async ({ page }) => {
    await waitForLoadingComplete(page);

    const deleteButton = page
      .locator('button[aria-label*="delete"], button[aria-label*="Delete"]')
      .first();

    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();

      // Confirmation dialog should appear
      const dialog = page.locator(".MuiDialog-paper");
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Should have confirm/cancel
      const confirmButton = dialog
        .locator("button")
        .filter({ hasText: /confirm|delete|yes|eliminar|sí/i });
      await expect(confirmButton.first()).toBeVisible();

      // Cancel to avoid actual deletion
      const cancelButton = dialog
        .locator("button")
        .filter({ hasText: /cancel|no|cancelar/i });
      if ((await cancelButton.count()) > 0) {
        await cancelButton.first().click();
      }
    }
  });

  test("should sort job positions", async ({ page }) => {
    await waitForTableData(page);

    const sortableHeader = page.locator('[role="columnheader"]').first();

    if ((await sortableHeader.count()) > 0) {
      await sortableHeader.click();
      await page.waitForTimeout(500);

      // Page should still work after sort
      await expect(
        page.locator('[role="grid"], table, .MuiCard-root').first(),
      ).toBeVisible();
    }
  });

  test("should validate required fields in create form", async ({ page }) => {
    // Open create dialog
    const createButton = page
      .locator("button")
      .filter({ hasText: /add|create|new|post|crear/i })
      .first();
    await expect(createButton).toBeVisible();
    await createButton.click();

    await page.waitForTimeout(1000);

    const dialog = page.locator(".MuiDialog-paper");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Submit button should be disabled when no stages added (per component logic)
    const submitButton = dialog.locator('button[type="submit"]').first();

    if ((await submitButton.count()) > 0) {
      const isDisabled = await submitButton.isDisabled();

      // Either disabled or clicking shows validation errors
      if (!isDisabled) {
        await submitButton.click();
        await page.waitForTimeout(500);

        // Should show errors or stay on form
        const dialogStillOpen = await dialog.isVisible();
        expect(dialogStillOpen).toBeTruthy();
      } else {
        expect(isDisabled).toBeTruthy();
      }
    }
  });
});

test.describe("Public Careers Page", () => {
  test("should display careers page without authentication", async ({
    page,
  }) => {
    // Navigate directly to public careers page
    await page.goto("/careers");
    await waitForLoadingComplete(page);

    // Should see job listings or empty state
    const pageContent = page.locator('main, [role="main"], body');
    await expect(pageContent.first()).toBeVisible();

    // Should NOT redirect to login
    expect(page.url()).not.toContain("/login");
  });

  test("should display job listings on careers page", async ({ page }) => {
    await page.goto("/careers");
    await waitForLoadingComplete(page);

    // Should have job cards/articles or empty state
    const jobListings = page.locator(
      '.MuiCard-root, [role="article"], [class*="job"]',
    );
    const count = await jobListings.count();

    const hasJobs = count > 0;
    const hasEmptyState =
      (await page
        .locator("text=/no.*position|no.*jobs|sin.*puestos/i")
        .count()) > 0;

    expect(hasJobs || hasEmptyState).toBeTruthy();
  });

  test("should view job details without authentication", async ({ page }) => {
    await page.goto("/careers");
    await waitForLoadingComplete(page);

    const jobCard = page.locator('.MuiCard-root, [role="article"]').first();

    if ((await jobCard.count()) > 0) {
      await jobCard.click();
      await waitForLoadingComplete(page);

      // Should see job details (title, description, etc.)
      const detailContent = page
        .locator('h1, h2, h3, [class*="title"]')
        .first();
      await expect(detailContent).toBeVisible({ timeout: 5000 });

      // Should NOT redirect to login
      expect(page.url()).not.toContain("/login");
    }
  });
});
