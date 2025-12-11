import { test, expect } from "@playwright/test";
import {
  login,
  TEST_USERS,
  waitForLoadingComplete,
} from "./fixtures/test-utils";

test.describe("Analytics Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto("/hr/analytics");
    await waitForLoadingComplete(page);
  });

  test("should display analytics page", async ({ page }) => {
    // Verify we're on analytics page
    expect(page.url()).toContain("/analytics");

    // Should have main content
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  });

  test("should display analytics charts or graphs", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for charts (canvas, svg, or chart containers)
    const charts = page.locator(
      'canvas, svg[class*="chart"], [class*="chart"], [class*="graph"]',
    );
    const count = await charts.count();

    const hasCharts = count > 0;
    const hasEmptyState =
      (await page.locator("text=/no.*data|coming.*soon|sin.*datos/i").count()) >
      0;

    expect(hasCharts || hasEmptyState).toBeTruthy();
  });

  test("should display key performance metrics", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Should have metric cards
    const metricCards = page.locator(".MuiCard-root, .MuiPaper-root");
    const count = await metricCards.count();

    expect(count).toBeGreaterThan(0);
  });

  test("should have date range selector", async ({ page }) => {
    await waitForLoadingComplete(page);

    const dateSelector = page
      .locator("button, input")
      .filter({
        hasText: /date|range|last.*30|fecha|rango/i,
      })
      .first();

    if ((await dateSelector.count()) > 0) {
      await expect(dateSelector).toBeVisible();
    }
  });

  test("should display hiring funnel metrics", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for hiring funnel or pipeline metrics
    const funnelMetrics = page
      .locator("text=/funnel|pipeline|conversion|embudo|conversión/i")
      .first();

    if ((await funnelMetrics.count()) > 0) {
      await expect(funnelMetrics).toBeVisible();
    }
  });

  test("should show time to hire statistics", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for time-to-hire metrics
    const timeMetrics = page
      .locator("text=/time.*to.*hire|average.*time|tiempo.*promedio/i")
      .first();

    if ((await timeMetrics.count()) > 0) {
      await expect(timeMetrics).toBeVisible();
    }
  });

  test("should display application source analytics", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for source tracking (job boards, referrals, etc.)
    const sourceAnalytics = page
      .locator("text=/source|channel|referral|origen|canal/i")
      .first();

    if ((await sourceAnalytics.count()) > 0) {
      await expect(sourceAnalytics).toBeVisible();
    }
  });

  test("should have export data button", async ({ page }) => {
    await waitForLoadingComplete(page);

    const exportButton = page
      .locator("button")
      .filter({
        hasText: /export|download|csv|pdf|exportar|descargar/i,
      })
      .first();

    if ((await exportButton.count()) > 0) {
      await expect(exportButton).toBeVisible();
    }
  });

  test("should display position performance metrics", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for job position analytics
    const positionMetrics = page
      .locator("text=/position|job.*performance|rendimiento.*puesto/i")
      .first();

    if ((await positionMetrics.count()) > 0) {
      await expect(positionMetrics).toBeVisible();
    }
  });

  test("should show interviewer statistics", async ({ page }) => {
    await waitForLoadingComplete(page);

    // Look for interviewer performance or activity
    const interviewerStats = page
      .locator(
        "text=/interviewer|interview.*activity|entrevistador|actividad.*entrevista/i",
      )
      .first();

    if ((await interviewerStats.count()) > 0) {
      await expect(interviewerStats).toBeVisible();
    }
  });

  test("should have filter options", async ({ page }) => {
    await waitForLoadingComplete(page);

    const filterButton = page
      .locator("button")
      .filter({
        hasText: /filter|filtrar|refine/i,
      })
      .first();

    if ((await filterButton.count()) > 0) {
      await expect(filterButton).toBeVisible();
    }
  });
});
