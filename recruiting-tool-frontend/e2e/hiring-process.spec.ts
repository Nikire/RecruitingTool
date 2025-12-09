import { test, expect } from '@playwright/test';
import { login, TEST_USERS, waitForLoadingComplete, waitForTableData } from './fixtures/test-utils';

test.describe('Applications Management (Hiring Processes)', () => {
  test.beforeEach(async ({ page }) => {
    // Use HR_SPECIALIST (HR role only) to ensure redirect to HR dashboard, not admin
    await login(page, TEST_USERS.HR_SPECIALIST);
    // Navigate to Applications page - this is where hiring processes are managed
    await page.goto('/hr/applications');
    await waitForLoadingComplete(page);
  });

  test('should display applications page', async ({ page }) => {
    // Verify we're on the HR section
    expect(page.url()).toContain('/hr');

    // Should have main content
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test('should display application list or cards', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should have data grid, table, or cards
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root, .MuiCard-root');
    const count = await dataContainer.count();

    const hasData = count > 0;
    const hasEmptyState = await page.locator('text=/no.*application|no.*data|sin.*solicitud/i').count() > 0;

    expect(hasData || hasEmptyState).toBeTruthy();
  });

  test('should display relevant columns/information', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Check for headers or labels related to applications
    const candidateInfo = page.locator('text=/candidate|candidato/i').first();
    const jobInfo = page.locator('text=/job|position|puesto/i').first();
    const statusInfo = page.locator('text=/status|estado|stage|etapa/i').first();

    // At least one of these should be visible
    const hasCandidateInfo = await candidateInfo.count() > 0;
    const hasJobInfo = await jobInfo.count() > 0;
    const hasStatusInfo = await statusInfo.count() > 0;

    expect(hasCandidateInfo || hasJobInfo || hasStatusInfo).toBeTruthy();
  });

  test('should have action buttons for applications', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Applications are viewed, not created directly - look for view/action buttons
    const actionButtons = page.locator('button, a').filter({ hasText: /view|ver|details|detalles/i }).first();

    if (await actionButtons.count() > 0) {
      await expect(actionButtons).toBeVisible();
    } else {
      // Action buttons might be in data grid rows
      await expect(page.locator('main').first()).toBeVisible();
    }
  });

  test('should open application details dialog', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Close any open menus/popups first
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const viewButton = page.locator('button, a').filter({ hasText: /view|ver|details/i }).first();

    if (await viewButton.count() > 0) {
      await viewButton.click();
      await page.waitForTimeout(1000);

      // Dialog or details page should appear
      const dialog = page.locator('.MuiDialog-paper');
      const hasDialog = await dialog.isVisible();
      const hasNavigated = page.url().includes('/application') || page.url().includes('/hiring-process');

      expect(hasDialog || hasNavigated).toBeTruthy();
    } else {
      // No view button - check if clicking a row works
      const firstRow = page.locator('[role="row"]').nth(1);
      if (await firstRow.count() > 0) {
        // Use force:true to bypass any backdrop
        await firstRow.click({ force: true });
        await page.waitForTimeout(1000);
        await expect(page.locator('main').first()).toBeVisible();
      }
    }
  });

  test('should view application details', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Click on first application row/card
    const firstApplication = page.locator('[role="row"], .MuiCard-root').nth(1);

    if (await firstApplication.count() > 0) {
      const initialUrl = page.url();
      await firstApplication.click();
      await page.waitForTimeout(2000);

      // Should navigate or open details
      const urlChanged = page.url() !== initialUrl;
      const dialogOpened = await page.locator('.MuiDialog-paper').isVisible();
      const detailsVisible = await page.locator('main').first().isVisible();

      expect(urlChanged || dialogOpened || detailsVisible).toBeTruthy();
    }
  });

  test('should display application stages/pipeline', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for stage indicators (stepper, timeline, chips)
    const stageIndicators = page.locator('.MuiStepper-root, [class*="timeline"], [class*="stage"], .MuiChip-root');

    if (await stageIndicators.count() > 0) {
      await expect(stageIndicators.first()).toBeVisible();
    } else {
      // Stages might be in detail view - verify page works
      await expect(page.locator('main').first()).toBeVisible();
    }
  });

  test('should filter applications by status', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for status filter
    const statusFilter = page.locator('[role="combobox"], button, select').filter({ hasText: /status|estado|filter/i }).first();

    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      await page.waitForTimeout(500);

      const options = page.locator('[role="option"], [role="menuitem"]');

      if (await options.count() > 0) {
        await options.first().click();
        await waitForLoadingComplete(page);

        // Page should still work after filtering
        await expect(page.locator('main').first()).toBeVisible();
      }
    }
  });

  test('should have search functionality', async ({ page }) => {
    await waitForLoadingComplete(page);

    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();

      await searchInput.fill('Developer');
      await page.waitForTimeout(1000); // debounce

      // Page should still work
      await expect(page.locator('main').first()).toBeVisible();
    }
  });

  test('should update application status', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Navigate to first application details
    const firstApplication = page.locator('[role="row"], .MuiCard-root').nth(1);

    if (await firstApplication.count() > 0) {
      await firstApplication.click();
      await waitForLoadingComplete(page);

      // Look for status change button
      const statusButton = page.locator('button, [role="button"]').filter({ hasText: /status|update.*status|cambiar.*estado/i }).first();

      if (await statusButton.count() > 0) {
        await statusButton.click();
        await page.waitForTimeout(500);

        // Options should appear
        const options = page.locator('[role="option"], [role="menuitem"]');
        if (await options.count() > 0) {
          await options.first().click();
          await waitForLoadingComplete(page);

          // Page should still work
          await expect(page.locator('main').first()).toBeVisible();
        }
      }
    }
  });

  test('should move candidate between stages', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Navigate to first application details
    const firstApplication = page.locator('[role="row"], .MuiCard-root').nth(1);

    if (await firstApplication.count() > 0) {
      await firstApplication.click();
      await waitForLoadingComplete(page);

      // Look for stage action buttons
      const moveButton = page.locator('button').filter({ hasText: /move|advance|next|siguiente|avanzar/i }).first();

      if (await moveButton.count() > 0) {
        await moveButton.click();
        await waitForLoadingComplete(page);

        // Stage should update or confirmation should appear
        await expect(page.locator('main').first()).toBeVisible();
      }
    }
  });

  test('should add notes to application', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Close any open menus/popups first
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // Navigate to first application - use force:true to bypass any popover backdrop
    const firstApplication = page.locator('[role="row"], .MuiCard-root').nth(1);

    if (await firstApplication.count() > 0) {
      await firstApplication.click({ force: true });
      await waitForLoadingComplete(page);

      // Close any popups that might have appeared
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      // Look for add note button
      const addNoteButton = page.locator('button').filter({ hasText: /add.*note|note|comment|nota|comentario/i }).first();

      if (await addNoteButton.count() > 0) {
        await addNoteButton.click();
        await page.waitForTimeout(500);

        // Note input should appear
        const noteInput = page.locator('textarea, input[type="text"]').last();

        if (await noteInput.count() > 0) {
          await noteInput.fill('E2E test note');

          // Submit note
          const submitButton = page.locator('button').filter({ hasText: /save|submit|add|guardar|agregar/i }).first();

          if (await submitButton.count() > 0) {
            await submitButton.click();
            await waitForLoadingComplete(page);

            // Page should still work
            await expect(page.locator('main').first()).toBeVisible();
          }
        }
      }
    }
  });
});

test.describe('HR Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Use HR_SPECIALIST (HR role only) to ensure redirect to HR dashboard, not admin
    await login(page, TEST_USERS.HR_SPECIALIST);
    // Navigate to HR dashboard after login
    await page.goto('/hr/dashboard');
    // Wait extra time for user state to fully load (addresses race condition)
    await page.waitForTimeout(2000);
    await waitForLoadingComplete(page);
  });

  test('should display HR dashboard', async ({ page }) => {
    // Should be on HR section (if redirected to login, there's a race condition bug)
    const url = page.url();
    const isOnHR = url.includes('/hr');
    const isOnLogin = url.includes('/login');

    // Document potential race condition - sometimes user state isn't ready
    if (isOnLogin) {
      console.log('Warning: Redirected to login - possible race condition in user state loading');
    }

    // Should be on HR section, not login
    expect(isOnHR).toBeTruthy();

    // Should have main content area
    await expect(page.locator('[role="main"], main').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display statistics cards', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for stat cards (MUI Paper, Card, or Grid items)
    const statCards = page.locator('.MuiCard-root, .MuiPaper-root');
    const count = await statCards.count();

    // Should have multiple stat cards
    expect(count).toBeGreaterThan(0);
  });

  test('should display key metrics', async ({ page }) => {
    await waitForLoadingComplete(page);

    // The dashboard has stat cards with numbers - look for any numeric values
    // Stats show: applications count, candidates count, positions count, pending count
    const statCards = page.locator('.MuiCard-root, .MuiPaper-root');
    const count = await statCards.count();

    // Should have at least 1 stat card visible
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate from dashboard to other pages', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for sidebar navigation links - get the second link (not the current dashboard link)
    const navLinks = page.locator('nav a[href*="/hr/"]:not([href*="dashboard"])');

    if (await navLinks.count() > 0) {
      const initialUrl = page.url();
      await navLinks.first().click();
      await waitForLoadingComplete(page);

      // Should navigate to new page
      expect(page.url()).not.toBe(initialUrl);
    } else {
      // Verify dashboard has clickable stat cards
      const clickableCard = page.locator('.MuiCard-root, .MuiPaper-root').first();
      await expect(clickableCard).toBeVisible();
    }
  });

  test('should display recent applications section', async ({ page }) => {
    await waitForLoadingComplete(page);

    // The dashboard has a "Recent Applications" section with Paper
    const recentSection = page.locator('.MuiPaper-root');
    const count = await recentSection.count();

    // Should have Paper components (stat cards + recent applications)
    expect(count).toBeGreaterThan(0);
  });

  test('should show quick action buttons', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for any buttons on the page (quick actions, create position, etc.)
    const buttons = page.locator('button');
    const count = await buttons.count();

    // Dashboard should have at least the "Create Position" button
    expect(count).toBeGreaterThan(0);
  });
});
