import { Page, Browser, chromium } from '@playwright/test';
import { login, TEST_USERS, waitForLoadingComplete } from '../fixtures/test-utils';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Screenshot Capture Utility
 *
 * Allows capturing screenshots of pages with authentication support.
 * Used by agents and developers to visually verify UI implementations.
 */

export interface ScreenshotOptions {
  /** Page path to capture (e.g., '/hr/dashboard') */
  pagePath: string;
  /** Whether page requires authentication */
  requiresAuth?: boolean;
  /** User credentials to use for login */
  userType?: 'HR_ADMIN' | 'HR_SPECIALIST' | 'HR_MANAGER';
  /** Output filename (without extension) */
  filename?: string;
  /** Wait for specific selector before capturing */
  waitForSelector?: string;
  /** Viewport size */
  viewport?: { width: number; height: number };
  /** Full page screenshot */
  fullPage?: boolean;
}

/**
 * Default screenshot directory
 */
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

/**
 * Ensure screenshot directory exists
 */
export function ensureScreenshotDir(): void {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

/**
 * Generate screenshot filename with timestamp
 */
export function generateFilename(pagePath: string, customFilename?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

  if (customFilename) {
    return `${customFilename}-${timestamp}.png`;
  }

  // Convert path to filename: /hr/dashboard -> hr-dashboard
  const pathSegment = pagePath
    .replace(/^\//, '') // Remove leading slash
    .replace(/\//g, '-') // Replace slashes with dashes
    .replace(/[^a-zA-Z0-9-]/g, '_'); // Replace special chars with underscore

  return `${pathSegment}-${timestamp}.png`;
}

/**
 * Capture screenshot of a specific page
 *
 * @param options Screenshot options
 * @returns Path to saved screenshot
 */
export async function captureScreenshot(options: ScreenshotOptions): Promise<string> {
  const {
    pagePath,
    requiresAuth = true,
    userType = 'HR_ADMIN',
    filename,
    waitForSelector,
    viewport = { width: 1920, height: 1080 },
    fullPage = true,
  } = options;

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Ensure screenshot directory exists
    ensureScreenshotDir();

    // Launch browser
    browser = await chromium.launch({
      headless: true,
    });

    // Set base URL
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    // Create page with viewport and baseURL
    page = await browser.newPage({
      viewport,
      baseURL,
    });

    // Login if authentication required
    if (requiresAuth) {
      const credentials = TEST_USERS[userType];

      // Navigate to login page
      await page.goto('/login');

      // Perform login
      await login(page, credentials);

      console.log(`Logged in as ${credentials.name} (${credentials.email})`);
    }

    // Navigate to target page
    console.log(`Navigating to ${pagePath}...`);
    await page.goto(pagePath);

    // Wait for page to load
    await waitForLoadingComplete(page);

    // Wait for specific selector if provided
    if (waitForSelector) {
      console.log(`Waiting for selector: ${waitForSelector}`);
      await page.waitForSelector(waitForSelector, { state: 'visible', timeout: 10000 });
    }

    // Give UI a moment to settle
    await page.waitForTimeout(1000);

    // Generate filename
    const screenshotFilename = generateFilename(pagePath, filename);
    const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFilename);

    // Capture screenshot
    console.log(`Capturing screenshot...`);
    await page.screenshot({
      path: screenshotPath,
      fullPage,
    });

    console.log(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;

  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    throw error;
  } finally {
    // Cleanup
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Capture screenshots of multiple pages
 *
 * @param pages Array of page paths
 * @param options Common options for all screenshots
 * @returns Array of screenshot paths
 */
export async function captureMultipleScreenshots(
  pages: string[],
  options: Omit<ScreenshotOptions, 'pagePath'> = {}
): Promise<string[]> {
  const results: string[] = [];

  for (const pagePath of pages) {
    try {
      const screenshotPath = await captureScreenshot({
        ...options,
        pagePath,
      });
      results.push(screenshotPath);
    } catch (error) {
      console.error(`Failed to capture ${pagePath}:`, error);
    }
  }

  return results;
}

/**
 * Predefined page sets for bulk captures
 */
export const PAGE_SETS = {
  HR_PAGES: [
    '/hr/dashboard',
    '/hr/applications',
    '/hr/candidates',
    '/hr/job-positions',
    '/hr/analytics',
  ],
  PUBLIC_PAGES: [
    '/careers',
    '/login',
  ],
  ADMIN_PAGES: [
    '/admin/dashboard',
    '/admin/users',
    '/admin/companies',
  ],
};

/**
 * Capture all HR pages
 */
export async function captureAllHRPages(
  userType: 'HR_ADMIN' | 'HR_SPECIALIST' | 'HR_MANAGER' = 'HR_ADMIN'
): Promise<string[]> {
  console.log('Capturing all HR pages...');
  return captureMultipleScreenshots(PAGE_SETS.HR_PAGES, {
    requiresAuth: true,
    userType,
  });
}

/**
 * Capture all public pages
 */
export async function captureAllPublicPages(): Promise<string[]> {
  console.log('Capturing all public pages...');
  return captureMultipleScreenshots(PAGE_SETS.PUBLIC_PAGES, {
    requiresAuth: false,
  });
}
