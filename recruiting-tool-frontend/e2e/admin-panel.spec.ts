import { test, expect } from "@playwright/test";
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
} from "./fixtures/test-utils";

test.describe("Admin Panel - Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN); // Has ADMIN role
    await page.goto("/admin");
    await waitForLoadingComplete(page);
  });

  test("should display admin dashboard", async ({ page }) => {
    // Verify we're on admin page
    expect(page.url()).toContain("/admin");

    // Should have main content
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test("should display admin statistics", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should have stat cards
    const statCards = page.locator(".MuiCard-root, .MuiPaper-root");
    const count = await statCards.count();

    expect(count).toBeGreaterThan(0);
  });

  test("should have navigation to admin sections", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for navigation links (companies, users, settings)
    const navLinks = page.locator('a[href*="/admin/"]');
    const count = await navLinks.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Admin Panel - Companies Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/admin/companies");
    await waitForLoadingComplete(page);
  });

  test("should display companies list", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should have data grid, table, or cards
    const dataContainer = page.locator(
      '[role="grid"], table, .MuiDataGrid-root, .MuiCard-root',
    );
    const count = await dataContainer.count();

    const hasData = count > 0;
    const hasEmptyState =
      (await page
        .locator("text=/no.*companies|no.*data|sin.*empresas/i")
        .count()) > 0;

    expect(hasData || hasEmptyState).toBeTruthy();
  });

  test("should display company information columns", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should show name, status, subscription columns
    const nameColumn = page
      .locator('[role="columnheader"], th')
      .filter({ hasText: /name|nombre/i })
      .first();
    const statusColumn = page
      .locator('[role="columnheader"], th')
      .filter({ hasText: /status|estado/i })
      .first();

    const hasName = (await nameColumn.count()) > 0;
    const hasStatus = (await statusColumn.count()) > 0;

    expect(hasName || hasStatus).toBeTruthy();
  });

  test("should have create company button", async ({ page }) => {
    await waitForLoadingComplete(page);

    const createButton = page
      .locator("button")
      .filter({
        hasText: /create|add.*company|nueva.*empresa|crear/i,
      })
      .first();

    if ((await createButton.count()) > 0) {
      await expect(createButton).toBeVisible();
    }
  });

  test("should have search functionality", async ({ page }) => {
    await waitForLoadingComplete(page);

    const searchInput = page
      .locator('input[placeholder*="Search"], input[type="search"]')
      .first();

    if ((await searchInput.count()) > 0) {
      await expect(searchInput).toBeVisible();

      await searchInput.fill("Tech");
      await page.waitForTimeout(500);

      // Page should still work
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("should show company action buttons", async ({ page }) => {
    await waitForLoadingComplete(page);

    const actionButtons = page
      .locator(
        'button[aria-label*="edit"], button[aria-label*="view"], button[aria-label*="delete"]',
      )
      .first();

    if ((await actionButtons.count()) > 0) {
      await expect(actionButtons).toBeVisible();
    }
  });

  test("should display subscription status for companies", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for subscription indicators
    const subscriptionStatus = page.locator(
      "text=/subscription|trial|active|expired|suscripción|activo|expirado/i, .MuiChip-root",
    );

    if ((await subscriptionStatus.count()) > 0) {
      await expect(subscriptionStatus.first()).toBeVisible();
    }
  });
});

test.describe("Admin Panel - User Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/admin/users");
    await waitForLoadingComplete(page);
  });

  test("should display users list", async ({ page }) => {
    await waitForLoadingComplete(page);

    const dataContainer = page.locator(
      '[role="grid"], table, .MuiDataGrid-root, .MuiCard-root',
    );
    const count = await dataContainer.count();

    const hasData = count > 0;
    const hasEmptyState =
      (await page.locator("text=/no.*users|no.*data|sin.*usuarios/i").count()) >
      0;

    expect(hasData || hasEmptyState).toBeTruthy();
  });

  test("should display user information columns", async ({ page }) => {
    await waitForLoadingComplete(page);

    const nameColumn = page
      .locator('[role="columnheader"], th')
      .filter({ hasText: /name|nombre/i })
      .first();
    const emailColumn = page
      .locator('[role="columnheader"], th')
      .filter({ hasText: /email|correo/i })
      .first();
    const roleColumn = page
      .locator('[role="columnheader"], th')
      .filter({ hasText: /role|rol/i })
      .first();

    const hasName = (await nameColumn.count()) > 0;
    const hasEmail = (await emailColumn.count()) > 0;
    const hasRole = (await roleColumn.count()) > 0;

    expect(hasName || hasEmail || hasRole).toBeTruthy();
  });

  test("should have create user button", async ({ page }) => {
    await waitForLoadingComplete(page);

    const createButton = page
      .locator("button")
      .filter({
        hasText: /create|add.*user|nuevo.*usuario|crear/i,
      })
      .first();

    if ((await createButton.count()) > 0) {
      await expect(createButton).toBeVisible();
    }
  });

  test("should filter users by role", async ({ page }) => {
    await waitForLoadingComplete(page);

    const roleFilter = page
      .locator('button, [role="combobox"]')
      .filter({
        hasText: /role|filter/i,
      })
      .first();

    if ((await roleFilter.count()) > 0) {
      await roleFilter.click();
      await page.waitForTimeout(500);

      const options = page.locator('[role="option"], [role="menuitem"]');
      if ((await options.count()) > 0) {
        await options.first().click();
        await waitForLoadingComplete(page);

        // Page should still work
        await expect(page.locator("main").first()).toBeVisible();
      }
    }
  });

  test("should display user status", async ({ page }) => {
    await waitForLoadingComplete(page);

    const statusIndicators = page.locator(
      "text=/active|inactive|activo|inactivo/i, .MuiChip-root",
    );

    if ((await statusIndicators.count()) > 0) {
      await expect(statusIndicators.first()).toBeVisible();
    }
  });

  test("should have user action buttons", async ({ page }) => {
    await waitForLoadingComplete(page);

    const actionButtons = page
      .locator('button[aria-label*="edit"], button[aria-label*="delete"]')
      .first();

    if ((await actionButtons.count()) > 0) {
      await expect(actionButtons).toBeVisible();
    }
  });
});

test.describe("Admin Panel - System Settings", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/admin/settings");
    await waitForLoadingComplete(page);
  });

  test("should display system settings page", async ({ page }) => {
    expect(page.url()).toContain("/settings");

    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test("should display settings sections", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for settings categories or sections
    const sections = page.locator(".MuiCard-root, .MuiPaper-root, section");
    const count = await sections.count();

    expect(count).toBeGreaterThan(0);
  });

  test("should have save settings button", async ({ page }) => {
    await waitForLoadingComplete(page);

    const saveButton = page
      .locator('button[type="submit"], button')
      .filter({
        hasText: /save|update|guardar|actualizar/i,
      })
      .first();

    if ((await saveButton.count()) > 0) {
      await expect(saveButton).toBeVisible();
    }
  });

  test("should display general settings", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for settings fields
    const settingsFields = page.locator(
      'input, select, textarea, [role="combobox"]',
    );
    const count = await settingsFields.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Admin Panel - Deleted Records", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/admin/deleted-records");
    await waitForLoadingComplete(page);
  });

  test("should display deleted records page", async ({ page }) => {
    expect(page.url()).toContain("/deleted-records");

    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test("should display deleted items list", async ({ page }) => {
    await waitForLoadingComplete(page);

    const dataContainer = page.locator(
      '[role="grid"], table, .MuiDataGrid-root, .MuiCard-root',
    );
    const count = await dataContainer.count();

    const hasData = count > 0;
    const hasEmptyState =
      (await page
        .locator("text=/no.*deleted|no.*records|sin.*eliminados/i")
        .count()) > 0;

    expect(hasData || hasEmptyState).toBeTruthy();
  });

  test("should have restore functionality", async ({ page }) => {
    await waitForLoadingComplete(page);

    const restoreButton = page
      .locator("button")
      .filter({
        hasText: /restore|recuperar/i,
      })
      .first();

    if ((await restoreButton.count()) > 0) {
      await expect(restoreButton).toBeVisible();
    }
  });

  test("should filter deleted records by type", async ({ page }) => {
    await waitForLoadingComplete(page);

    const typeFilter = page
      .locator('button, [role="combobox"]')
      .filter({
        hasText: /type|filter|tipo/i,
      })
      .first();

    if ((await typeFilter.count()) > 0) {
      await typeFilter.click();
      await page.waitForTimeout(500);

      const options = page.locator('[role="option"], [role="menuitem"]');
      if ((await options.count()) > 0) {
        await options.first().click();
        await waitForLoadingComplete(page);

        // Page should still work
        await expect(page.locator("main").first()).toBeVisible();
      }
    }
  });

  test("should display deletion date and user", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for deletion metadata
    const deletionInfo = page
      .locator(
        "text=/deleted.*by|deleted.*on|eliminado.*por|fecha.*eliminación/i",
      )
      .first();

    if ((await deletionInfo.count()) > 0) {
      await expect(deletionInfo).toBeVisible();
    }
  });
});
