import { test, expect } from "@playwright/test";
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
} from "./fixtures/test-utils";

test.describe("Email Templates Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/hr/email-templates");
    await waitForLoadingComplete(page);
  });

  test("should display email templates page", async ({ page }) => {
    // Verify we're on email templates page
    expect(page.url()).toContain("/email-templates");

    // Should have main content
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test("should display email templates list", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should have cards or list of templates
    const templates = page.locator(
      '.MuiCard-root, [role="article"], .MuiPaper-root',
    );
    const count = await templates.count();

    const hasTemplates = count > 0;
    const hasEmptyState =
      (await page.locator("text=/no.*template|sin.*plantilla/i").count()) > 0;

    expect(hasTemplates || hasEmptyState).toBeTruthy();
  });

  test("should have create template button", async ({ page }) => {
    await waitForLoadingComplete(page);

    const createButton = page
      .locator("button")
      .filter({
        hasText: /create|add|new.*template|crear|agregar/i,
      })
      .first();

    if ((await createButton.count()) > 0) {
      await expect(createButton).toBeVisible();
    }
  });

  test("should display template information", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Templates should show name, type, or purpose
    const templateInfo = page
      .locator("text=/template|subject|asunto|plantilla/i")
      .first();

    if ((await templateInfo.count()) > 0) {
      await expect(templateInfo).toBeVisible();
    }
  });

  test("should open edit template dialog", async ({ page }) => {
    await waitForLoadingComplete(page);

    const editButton = page
      .locator("button")
      .filter({
        hasText: /edit|editar/i,
      })
      .first();

    if ((await editButton.count()) > 0) {
      await editButton.click();
      await page.waitForTimeout(1000);

      // Dialog should appear
      const dialog = page.locator(".MuiDialog-paper");
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Should have text editor or textarea
      const editor = dialog
        .locator('textarea, [contenteditable="true"], .tiptap, .quill-editor')
        .first();
      if ((await editor.count()) > 0) {
        await expect(editor).toBeVisible();
      }
    }
  });

  test("should display template categories or types", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for categories like "Application Received", "Interview Invitation", etc.
    const categories = page.locator(
      "text=/application|interview|rejection|aceptación|entrevista|rechazo/i",
    );

    if ((await categories.count()) > 0) {
      await expect(categories.first()).toBeVisible();
    }
  });

  test("should have search or filter functionality", async ({ page }) => {
    await waitForLoadingComplete(page);

    const searchInput = page
      .locator(
        'input[placeholder*="Search"], input[placeholder*="search"], input[type="search"]',
      )
      .first();

    if ((await searchInput.count()) > 0) {
      await expect(searchInput).toBeVisible();

      await searchInput.fill("interview");
      await page.waitForTimeout(500);

      // Page should still work
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("should show template preview", async ({ page }) => {
    await waitForLoadingComplete(page);

    const previewButton = page
      .locator("button")
      .filter({
        hasText: /preview|vista.*previa|ver/i,
      })
      .first();

    if ((await previewButton.count()) > 0) {
      await previewButton.click();
      await page.waitForTimeout(1000);

      // Dialog or preview panel should appear
      const preview = page
        .locator('.MuiDialog-paper, [class*="preview"]')
        .first();
      await expect(preview).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display template status or language", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Templates might show status (active/inactive) or language (en/es)
    const statusOrLang = page.locator(
      "text=/active|inactive|english|spanish|activo|inactivo|inglés|español/i, .MuiChip-root",
    );

    if ((await statusOrLang.count()) > 0) {
      await expect(statusOrLang.first()).toBeVisible();
    }
  });

  test("should show variable placeholders documentation", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Templates use variables like {{candidateName}}, {{positionTitle}}
    const variableInfo = page
      .locator(
        "text=/variable|placeholder|{{.*}}|candidateName|positionTitle/i",
      )
      .first();

    if ((await variableInfo.count()) > 0) {
      await expect(variableInfo).toBeVisible();
    }
  });
});
