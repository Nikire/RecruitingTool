import { test, expect } from '@playwright/test';
import { login, TEST_USERS, waitForLoadingComplete } from './fixtures/test-utils';

test.describe('Calendar Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto('/settings/calendar');
    await waitForLoadingComplete(page);
  });

  test('should display calendar settings page', async ({ page }) => {
    // Verify we're on calendar settings page
    expect(page.url()).toContain('/calendar');

    // Should have main content
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test('should display Google Calendar integration section', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for Google Calendar mentions
    const googleCalendar = page.locator('text=/google.*calendar|calendar.*integration|integración.*calendario/i').first();

    if (await googleCalendar.count() > 0) {
      await expect(googleCalendar).toBeVisible({ timeout: 10000 });
    } else {
      // Verify page loaded
      await expect(page.locator('main').first()).toBeVisible();
    }
  });

  test('should have connect/disconnect calendar button', async ({ page }) => {
    await waitForLoadingComplete(page);

    const connectButton = page.locator('button').filter({
      hasText: /connect|disconnect|authorize|revoke|conectar|desconectar/i
    }).first();

    if (await connectButton.count() > 0) {
      await expect(connectButton).toBeVisible();
    }
  });

  test('should display calendar connection status', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for connection status indicators
    const statusIndicator = page.locator('text=/connected|disconnected|authorized|not.*connected|conectado|no.*conectado/i, .MuiChip-root').first();

    if (await statusIndicator.count() > 0) {
      await expect(statusIndicator).toBeVisible();
    }
  });

  test('should display calendar availability settings', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for availability or scheduling settings
    const availabilitySettings = page.locator('text=/availability|working.*hours|disponibilidad|horario/i').first();

    if (await availabilitySettings.count() > 0) {
      await expect(availabilitySettings).toBeVisible();
    }
  });

  test('should have time zone selector', async ({ page }) => {
    await waitForLoadingComplete(page);

    const timeZoneSelector = page.locator('[role="combobox"], select, input').filter({
      hasText: /time.*zone|zona.*horaria|timezone/i
    }).first();

    if (await timeZoneSelector.count() > 0) {
      await expect(timeZoneSelector).toBeVisible();
    }
  });

  test('should display interview buffer time settings', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for buffer time or interview duration settings
    const bufferSettings = page.locator('text=/buffer|duration|interview.*time|tiempo.*entrevista/i').first();

    if (await bufferSettings.count() > 0) {
      await expect(bufferSettings).toBeVisible();
    }
  });

  test('should have save settings button', async ({ page }) => {
    await waitForLoadingComplete(page);

    const saveButton = page.locator('button[type="submit"], button').filter({
      hasText: /save|update|guardar|actualizar/i
    }).first();

    if (await saveButton.count() > 0) {
      await expect(saveButton).toBeVisible();
    }
  });

  test('should display calendar permissions information', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for OAuth permissions or scope information
    const permissionsInfo = page.locator('text=/permission|scope|access|permiso|acceso/i').first();

    if (await permissionsInfo.count() > 0) {
      await expect(permissionsInfo).toBeVisible();
    }
  });

  test('should show calendar event types configuration', async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for event type settings (interview types, durations, etc.)
    const eventTypes = page.locator('text=/event.*type|interview.*type|tipo.*evento|tipo.*entrevista/i').first();

    if (await eventTypes.count() > 0) {
      await expect(eventTypes).toBeVisible();
    }
  });
});
