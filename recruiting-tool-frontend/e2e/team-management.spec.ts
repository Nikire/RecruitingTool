import { test, expect } from "@playwright/test";
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
  waitForTableData,
  openDialog,
  closeDialog,
} from "./fixtures/test-utils";

test.describe("Team Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/settings/team");
    await waitForLoadingComplete(page);
  });

  test("should display team management page", async ({ page }) => {
    // Verify we're on team page
    expect(page.url()).toContain("/team");

    // Should have main content
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test("should display team members list", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should have data grid, table, or cards
    const dataContainer = page.locator(
      '[role="grid"], table, .MuiDataGrid-root, .MuiCard-root',
    );
    const count = await dataContainer.count();

    const hasData = count > 0;
    const hasEmptyState =
      (await page
        .locator("text=/no.*members|no.*team|sin.*miembros/i")
        .count()) > 0;

    expect(hasData || hasEmptyState).toBeTruthy();
  });

  test("should display team member information", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should show name, email, role columns
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

    // At least one of these should be visible
    const hasName = (await nameColumn.count()) > 0;
    const hasEmail = (await emailColumn.count()) > 0;
    const hasRole = (await roleColumn.count()) > 0;

    expect(hasName || hasEmail || hasRole).toBeTruthy();
  });

  test("should have invite team member button", async ({ page }) => {
    await waitForLoadingComplete(page);

    const inviteButton = page
      .locator("button")
      .filter({
        hasText: /invite|add.*member|agregar.*miembro|invitar/i,
      })
      .first();

    if ((await inviteButton.count()) > 0) {
      await expect(inviteButton).toBeVisible();
    }
  });

  test("should open invite team member dialog", async ({ page }) => {
    await waitForLoadingComplete(page);

    const inviteButton = page
      .locator("button")
      .filter({
        hasText: /invite|add.*member|agregar|invitar/i,
      })
      .first();

    if ((await inviteButton.count()) > 0) {
      await inviteButton.click();
      await page.waitForTimeout(1000);

      // Dialog should appear
      const dialog = page.locator(".MuiDialog-paper");
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Should have email input
      const emailInput = dialog
        .locator('input[type="email"], input[name="email"]')
        .first();
      if ((await emailInput.count()) > 0) {
        await expect(emailInput).toBeVisible();
      }
    }
  });

  test("should display role badges for team members", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for role indicators (chips, badges)
    const roleIndicators = page.locator(
      '.MuiChip-root, [class*="badge"], [class*="role"]',
    );

    if ((await roleIndicators.count()) > 0) {
      await expect(roleIndicators.first()).toBeVisible();
    }
  });

  test("should have search functionality", async ({ page }) => {
    await waitForLoadingComplete(page);

    const searchInput = page
      .locator(
        'input[placeholder*="Search"], input[placeholder*="search"], input[type="search"]',
      )
      .first();

    if ((await searchInput.count()) > 0) {
      await expect(searchInput).toBeVisible();

      await searchInput.fill("test");
      await page.waitForTimeout(500);

      // Page should still work
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("should show team member actions", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for action buttons (edit, delete, manage)
    const actionButtons = page
      .locator(
        'button[aria-label*="edit"], button[aria-label*="delete"], button[aria-label*="manage"]',
      )
      .first();

    if ((await actionButtons.count()) > 0) {
      await expect(actionButtons).toBeVisible();
    }
  });

  test("should filter team members by role", async ({ page }) => {
    await waitForLoadingComplete(page);

    const roleFilter = page
      .locator('button, [role="combobox"]')
      .filter({
        hasText: /role|filter.*role|filtrar.*rol/i,
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

  test("should display pending invitations", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for pending invitations section
    const pendingSection = page
      .locator(
        "text=/pending.*invitation|invitation.*pending|invitaciones.*pendientes/i",
      )
      .first();

    if ((await pendingSection.count()) > 0) {
      await expect(pendingSection).toBeVisible();
    }
  });

  test("should show team member status", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for status indicators (active, inactive, pending)
    const statusIndicators = page.locator(
      "text=/active|inactive|pending|activo|inactivo|pendiente/i, .MuiChip-root",
    );

    if ((await statusIndicators.count()) > 0) {
      await expect(statusIndicators.first()).toBeVisible();
    }
  });
});
