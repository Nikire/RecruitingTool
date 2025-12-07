#!/usr/bin/env node
/**
 * CLI Script for Capturing Screenshots
 *
 * Usage:
 *   npm run screenshot /hr/dashboard
 *   npm run screenshot /hr/candidates -- --user=HR_SPECIALIST
 *   npm run screenshot /careers -- --public
 *   npm run screenshot /hr/applications -- --filename=custom-name
 *   npm run screenshot --all-hr
 *   npm run screenshot --all-public
 *
 * Options:
 *   --user=HR_ADMIN|HR_SPECIALIST|HR_MANAGER  User type for authentication (default: HR_ADMIN)
 *   --public                                   Skip authentication
 *   --filename=name                            Custom filename prefix
 *   --wait-for=selector                        Wait for specific selector before capturing
 *   --all-hr                                   Capture all HR pages
 *   --all-public                               Capture all public pages
 */

import {
  captureScreenshot,
  captureAllHRPages,
  captureAllPublicPages,
  ScreenshotOptions,
} from '../e2e/utils/screenshot';

/**
 * Parse command line arguments
 */
function parseArgs(): {
  pagePath?: string;
  options: Partial<ScreenshotOptions>;
  captureAllHR: boolean;
  captureAllPublic: boolean;
} {
  const args = process.argv.slice(2);

  const result: {
    pagePath?: string;
    options: Partial<ScreenshotOptions>;
    captureAllHR: boolean;
    captureAllPublic: boolean;
  } = {
    options: {},
    captureAllHR: false,
    captureAllPublic: false,
  };

  for (const arg of args) {
    if (arg === '--all-hr') {
      result.captureAllHR = true;
    } else if (arg === '--all-public') {
      result.captureAllPublic = true;
    } else if (arg === '--public') {
      result.options.requiresAuth = false;
    } else if (arg.startsWith('--user=')) {
      const userType = arg.split('=')[1] as 'HR_ADMIN' | 'HR_SPECIALIST' | 'HR_MANAGER';
      result.options.userType = userType;
    } else if (arg.startsWith('--filename=')) {
      result.options.filename = arg.split('=')[1];
    } else if (arg.startsWith('--wait-for=')) {
      result.options.waitForSelector = arg.split('=')[1];
    } else if (arg.startsWith('--viewport=')) {
      const [width, height] = arg.split('=')[1].split('x').map(Number);
      result.options.viewport = { width, height };
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('--')) {
      // Remove Windows path prefix if present (Git Bash adds C:/Program Files/Git/)
      let cleanedPath = arg;
      if (cleanedPath.includes(':/Program Files/Git/')) {
        cleanedPath = cleanedPath.replace(/^.*:\/Program Files\/Git/, '');
      }
      // Ensure path starts with /
      if (!cleanedPath.startsWith('/')) {
        cleanedPath = '/' + cleanedPath;
      }
      result.pagePath = cleanedPath;
    }
  }

  return result;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Screenshot Capture Utility

Usage:
  npm run screenshot <page-path> [options]
  npm run screenshot --all-hr
  npm run screenshot --all-public

Examples:
  npm run screenshot /hr/dashboard
  npm run screenshot /hr/candidates -- --user=HR_SPECIALIST
  npm run screenshot /careers -- --public
  npm run screenshot /hr/applications -- --filename=my-screenshot
  npm run screenshot /hr/dashboard -- --wait-for=".MuiDataGrid-root"
  npm run screenshot /hr/analytics -- --viewport=1280x720
  npm run screenshot --all-hr
  npm run screenshot --all-public

Options:
  --user=TYPE          User type for login (HR_ADMIN, HR_SPECIALIST, HR_MANAGER)
                       Default: HR_ADMIN
  --public             Skip authentication (for public pages)
  --filename=NAME      Custom filename prefix
  --wait-for=SELECTOR  Wait for CSS selector before capturing
  --viewport=WxH       Viewport size (e.g., 1920x1080)
                       Default: 1920x1080
  --all-hr             Capture all HR pages
  --all-public         Capture all public pages
  --help, -h           Show this help message

Page Paths:
  HR Pages:
    /hr/dashboard
    /hr/applications
    /hr/candidates
    /hr/job-positions
    /hr/analytics

  Public Pages:
    /careers
    /login

  Admin Pages:
    /admin/dashboard
    /admin/users
    /admin/companies

Screenshots are saved to: recruiting-tool-frontend/screenshots/
`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const { pagePath, options, captureAllHR, captureAllPublic } = parseArgs();

    // Validate arguments
    if (captureAllHR) {
      const screenshots = await captureAllHRPages(options.userType);
      console.log(`\n✅ Captured ${screenshots.length} HR pages successfully!`);
      console.log('Screenshots:', screenshots);
      return;
    }

    if (captureAllPublic) {
      const screenshots = await captureAllPublicPages();
      console.log(`\n✅ Captured ${screenshots.length} public pages successfully!`);
      console.log('Screenshots:', screenshots);
      return;
    }

    if (!pagePath) {
      console.error('❌ Error: Page path is required');
      console.log('Run "npm run screenshot --help" for usage information');
      process.exit(1);
    }

    // Capture single screenshot
    console.log(`\n📸 Capturing screenshot of ${pagePath}...`);
    console.log('Options:', JSON.stringify(options, null, 2));

    const screenshotPath = await captureScreenshot({
      pagePath,
      ...options,
    });

    console.log(`\n✅ Screenshot captured successfully!`);
    console.log(`📁 Path: ${screenshotPath}`);
    console.log(`\n💡 To view the screenshot, use the Read tool with this path.`);

  } catch (error) {
    console.error('❌ Failed to capture screenshot:', error);
    process.exit(1);
  }
}

// Execute main function
main();
