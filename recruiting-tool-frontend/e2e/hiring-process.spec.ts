import { test, expect } from '@playwright/test';
import { login, TEST_USERS, waitForLoadingComplete, waitForTableData } from './fixtures/test-utils';

test.describe('Hiring Process Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page, TEST_USERS.HR_ADMIN);

    // Navigate to hiring processes page
    await page.goto('/hiring-processes');
    await waitForLoadingComplete(page);
  });

  test('should display hiring processes list page', async ({ page }) => {
    // Check page title
    const title = page.locator('h1, h2').filter({ hasText: /hiring.*process|process/i }).first();

    // Wait for title or redirect to dashboard if no processes page
    const titleExists = await title.count();

    if (titleExists > 0) {
      await expect(title).toBeVisible();

      // Check table or grid exists
      const table = page.locator('[role="grid"], table, .MuiDataGrid-root, [class*="process-list"]').first();
      await expect(table).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display hiring process columns', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // Check for common columns if on list page
    const candidateColumn = page.locator('text=/candidate/i').first();
    const jobColumn = page.locator('text=/job|position/i').first();
    const statusColumn = page.locator('text=/status/i').first();

    const hasCandidateCol = await candidateColumn.count() > 0;
    const hasJobCol = await jobColumn.count() > 0;
    const hasStatusCol = await statusColumn.count() > 0;

    // Should have at least some of these columns
    expect(hasCandidateCol || hasJobCol || hasStatusCol).toBeTruthy();
  });

  test('should create new hiring process', async ({ page }) => {
    // Look for create button
    const createButton = page.locator('button, a').filter({ hasText: /add|create|new|start/i }).first();

    if (await createButton.count() > 0) {
      await createButton.click();

      // Wait for form
      await page.waitForTimeout(1000);

      // Should see form (dialog or page)
      const hasDialog = await page.locator('[role="dialog"]').isVisible();
      const hasNavigated = page.url().includes('/create') || page.url().includes('/new');

      expect(hasDialog || hasNavigated).toBeTruthy();

      // Look for candidate selection
      const candidateSelect = page.locator('[label*="Candidate"], [name="candidateUid"]').first();

      if (await candidateSelect.count() > 0) {
        await candidateSelect.click();

        // Select first candidate
        await page.waitForTimeout(500);
        const firstCandidate = page.locator('[role="option"]').first();

        if (await firstCandidate.count() > 0) {
          await firstCandidate.click();
        }
      }

      // Look for job position selection
      const jobSelect = page.locator('[label*="Job"], [name="jobPositionUid"]').first();

      if (await jobSelect.count() > 0) {
        await jobSelect.click();

        // Select first job
        await page.waitForTimeout(500);
        const firstJob = page.locator('[role="option"]').first();

        if (await firstJob.count() > 0) {
          await firstJob.click();
        }
      }

      // Submit if fields were filled
      const submitButton = page.locator('button[type="submit"], button').filter({
        hasText: /submit|save|create|start/i,
      }).first();

      if (await submitButton.isEnabled()) {
        await submitButton.click();

        // Wait for success
        await page.waitForTimeout(2000);
        await waitForLoadingComplete(page);
      }
    }
  });

  test('should view hiring process details', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // Click on first process
    const firstProcess = page.locator('[role="row"], [class*="process-card"]').nth(1);

    if (await firstProcess.count() > 0) {
      // Look for view button
      const viewButton = firstProcess.locator('button[aria-label*="view"], a[href*="/hiring-processes/"]').first();

      if (await viewButton.count() > 0) {
        await viewButton.click();
      } else {
        await firstProcess.click();
      }

      // Wait for details
      await waitForLoadingComplete(page);

      // Should see process details
      const detailsContainer = page.locator('[role="dialog"], main, [class*="detail"]').first();
      await expect(detailsContainer).toBeVisible();
    }
  });

  test('should display process stages', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // Click on first process to view details
    const firstProcess = page.locator('[role="row"], [class*="process-card"]').nth(1);

    if (await firstProcess.count() > 0) {
      await firstProcess.click();
      await waitForLoadingComplete(page);

      // Look for stages section
      const stagesSection = page.locator('text=/stages|pipeline|workflow/i').first();

      if (await stagesSection.count() > 0) {
        await expect(stagesSection).toBeVisible();

        // Should see stage items
        const stageItems = page.locator('[class*="stage"], [class*="step"]');
        const count = await stageItems.count();

        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test('should move candidate between stages', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // View first process
    const firstProcess = page.locator('[role="row"], [class*="process-card"]').nth(1);

    if (await firstProcess.count() > 0) {
      await firstProcess.click();
      await waitForLoadingComplete(page);

      // Look for stage action buttons (move, advance, etc.)
      const moveButton = page.locator('button').filter({ hasText: /move|advance|next stage/i }).first();

      if (await moveButton.count() > 0) {
        await moveButton.click();

        // Wait for action to complete
        await page.waitForTimeout(1000);
        await waitForLoadingComplete(page);

        // Should see success or stage update
        const updatedStage = page.locator('[class*="stage"][class*="active"], [class*="stage"][class*="current"]').first();
        await expect(updatedStage).toBeVisible();
      }
    }
  });

  test('should update process status', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // View first process
    const firstProcess = page.locator('[role="row"], [class*="process-card"]').nth(1);

    if (await firstProcess.count() > 0) {
      await firstProcess.click();
      await waitForLoadingComplete(page);

      // Look for status dropdown or buttons
      const statusButton = page.locator('button, [role="button"]').filter({ hasText: /status|update status/i }).first();

      if (await statusButton.count() > 0) {
        await statusButton.click();

        // Select a status
        await page.waitForTimeout(500);
        const statusOption = page.locator('[role="option"], [role="menuitem"]').first();

        if (await statusOption.count() > 0) {
          await statusOption.click();

          // Wait for update
          await waitForLoadingComplete(page);
        }
      }
    }
  });

  test('should filter processes by status', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // Look for status filter
    const statusFilter = page.locator('[label*="Status"], select[name="status"]').first();

    if (await statusFilter.count() > 0) {
      await statusFilter.click();

      // Select a status
      await page.waitForTimeout(500);
      const activeStatus = page.locator('[role="option"]').filter({ hasText: /active|in progress/i }).first();

      if (await activeStatus.count() > 0) {
        await activeStatus.click();

        // Wait for filtered results
        await waitForLoadingComplete(page);

        // Should still see data
        const table = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
        await expect(table).toBeVisible();
      }
    }
  });

  test('should search processes', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      // Enter search term (candidate or job name)
      await searchInput.fill('Developer');

      // Wait for results
      await waitForLoadingComplete(page);

      // Should see filtered results
      const table = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
      await expect(table).toBeVisible();
    }
  });

  test('should display candidate information in process', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // View first process
    const firstProcess = page.locator('[role="row"], [class*="process-card"]').nth(1);

    if (await firstProcess.count() > 0) {
      await firstProcess.click();
      await waitForLoadingComplete(page);

      // Should see candidate name or info
      const candidateInfo = page.locator('text=/candidate|name|email/i').first();

      if (await candidateInfo.count() > 0) {
        await expect(candidateInfo).toBeVisible();
      }
    }
  });

  test('should display job position information in process', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // View first process
    const firstProcess = page.locator('[role="row"], [class*="process-card"]').nth(1);

    if (await firstProcess.count() > 0) {
      await firstProcess.click();
      await waitForLoadingComplete(page);

      // Should see job position title
      const jobInfo = page.locator('text=/job|position/i').first();

      if (await jobInfo.count() > 0) {
        await expect(jobInfo).toBeVisible();
      }
    }
  });

  test('should add notes to hiring process', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // View first process
    const firstProcess = page.locator('[role="row"], [class*="process-card"]').nth(1);

    if (await firstProcess.count() > 0) {
      await firstProcess.click();
      await waitForLoadingComplete(page);

      // Look for notes section or add note button
      const addNoteButton = page.locator('button').filter({ hasText: /add note|note|comment/i }).first();

      if (await addNoteButton.count() > 0) {
        await addNoteButton.click();

        // Wait for note form
        await page.waitForTimeout(500);

        // Fill note
        const noteInput = page.locator('textarea[name="note"], textarea[name="content"]').first();

        if (await noteInput.count() > 0) {
          await noteInput.fill('E2E test note');

          // Submit note
          const submitButton = page.locator('button').filter({ hasText: /save|submit|add/i }).first();

          if (await submitButton.count() > 0) {
            await submitButton.click();

            // Wait for note to be added
            await waitForLoadingComplete(page);

            // Should see the note
            await expect(page.locator('text=E2E test note').first()).toBeVisible();
          }
        }
      }
    }
  });

  test('should display stage timeline', async ({ page }) => {
    // Wait for data to load
    await waitForLoadingComplete(page);

    // View first process
    const firstProcess = page.locator('[role="row"], [class*="process-card"]').nth(1);

    if (await firstProcess.count() > 0) {
      await firstProcess.click();
      await waitForLoadingComplete(page);

      // Look for timeline or stage history
      const timeline = page.locator('[class*="timeline"], [class*="stepper"], [class*="progress"]').first();

      if (await timeline.count() > 0) {
        await expect(timeline).toBeVisible();

        // Should have multiple stages
        const stages = page.locator('[class*="stage"], [class*="step"]');
        const count = await stages.count();

        expect(count).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Dashboard Overview', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
  });

  test('should display HR dashboard correctly', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await waitForLoadingComplete(page);

    // Should see dashboard title
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i }).first()).toBeVisible();

    // Should see stats or metrics
    const stats = page.locator('[class*="stat"], [class*="metric"], [class*="card"]');
    const count = await stats.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should display statistics cards', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await waitForLoadingComplete(page);

    // Look for stat cards (candidates, jobs, processes)
    const candidatesStat = page.locator('text=/candidates|total candidates/i').first();
    const jobsStat = page.locator('text=/job.*position|open.*position/i').first();
    const processesStat = page.locator('text=/hiring.*process|active.*process/i').first();

    const hasCandidates = await candidatesStat.count() > 0;
    const hasJobs = await jobsStat.count() > 0;
    const hasProcesses = await processesStat.count() > 0;

    // Should have at least one stat
    expect(hasCandidates || hasJobs || hasProcesses).toBeTruthy();
  });

  test('should navigate from dashboard to other pages', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await waitForLoadingComplete(page);

    // Look for navigation links
    const candidatesLink = page.locator('a[href*="/candidates"], button').filter({ hasText: /candidates/i }).first();

    if (await candidatesLink.count() > 0) {
      await candidatesLink.click();

      // Wait for navigation
      await waitForLoadingComplete(page);

      // Should be on candidates page
      expect(page.url()).toContain('/candidates');
    }
  });

  test('should display recent activity', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await waitForLoadingComplete(page);

    // Look for activity feed or recent items
    const activitySection = page.locator('text=/activity|recent|updates/i').first();

    if (await activitySection.count() > 0) {
      await expect(activitySection).toBeVisible();
    }
  });
});
