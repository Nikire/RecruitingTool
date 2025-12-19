# E2E Tests with Playwright

Comprehensive end-to-end testing suite for the BorderLess application using Playwright.

## Overview

This test suite covers critical user flows across the application:
- Authentication (login, logout, session persistence)
- Candidates management (list, create, view, edit, delete, search, filter)
- Job Positions management (list, create, view, edit, delete, public careers page)
- Hiring Processes management (list, create, view, stages, workflow)
- Dashboard overview and statistics

## Prerequisites

**IMPORTANT:** Tests run against Docker containers. Ensure containers are running:

```bash
# From project root
docker-compose up -d

# Verify containers are healthy
docker-compose ps
```

The frontend should be accessible at `http://localhost:3000` (configured in playwright.config.ts).

## Running Tests

### Run all tests (headless)
```bash
yarn test:e2e
```

### Run tests with UI (interactive mode)
```bash
yarn test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
yarn test:e2e:headed
```

### View test report
```bash
yarn test:e2e:report
```

### Run specific test file
```bash
yarn test:e2e auth.spec.ts
yarn test:e2e candidates.spec.ts
yarn test:e2e job-positions.spec.ts
yarn test:e2e hiring-process.spec.ts
```

### Run tests matching a pattern
```bash
yarn test:e2e --grep "login"
yarn test:e2e --grep "create candidate"
```

## Test Structure

```
e2e/
├── auth.spec.ts              # Authentication flows
├── candidates.spec.ts        # Candidates management
├── job-positions.spec.ts     # Job positions and careers page
├── hiring-process.spec.ts    # Hiring processes and dashboard
└── fixtures/
    └── test-utils.ts         # Shared test utilities and helpers
```

## Test Utilities

The `fixtures/test-utils.ts` file provides reusable helpers:

### Test Users
```typescript
import { TEST_USERS } from './fixtures/test-utils';

// Pre-configured test users from dummy data
TEST_USERS.HR_ADMIN      // alice@techinnovations.com (HR + ADMIN)
TEST_USERS.HR_SPECIALIST // bob@techinnovations.com (HR)
TEST_USERS.HR_MANAGER    // charlie@digitalsolutions.com (HR + ADMIN)
```

### Helper Functions
- `login(page, credentials)` - Login and wait for dashboard
- `logout(page)` - Logout user
- `waitForLoadingComplete(page)` - Wait for loading indicators
- `waitForTableData(page)` - Wait for data grid to load
- `generateTestData(prefix)` - Generate unique test data
- `openDialog(page, buttonText)` - Open modal/dialog
- `closeDialog(page)` - Close modal/dialog
- `waitForSuccessToast(page, message?)` - Wait for success notification
- `waitForErrorToast(page, message?)` - Wait for error notification
- `navigateTo(page, path)` - Navigate with loading wait
- `isAuthenticated(page)` - Check auth status
- `fillFormField(page, label, value)` - Fill form by label
- `clickButton(page, buttonText)` - Click button by text
- `selectOption(page, label, optionText)` - Select dropdown option

## Test Coverage

### Authentication Tests (13 tests)
- Display login page
- Login with valid credentials
- Show error with invalid credentials
- Validation for empty fields
- Logout functionality
- Protected route redirect
- Session persistence
- Password visibility toggle
- Different user roles
- Submit button state
- Email trimming

### Candidates Tests (12 tests)
- Display candidates list
- Display columns
- Search/filter candidates
- Create new candidate
- View candidate details
- Edit candidate
- Delete candidate
- Sort by column
- Pagination
- Field validation
- Email format validation
- Status filtering

### Job Positions Tests (14 tests)
- Display job positions list
- Display job cards/rows
- Search/filter jobs
- Create new job position
- View job details
- Display job status
- Filter by status
- Edit job position
- Delete job position
- Sort job positions
- Field validation
- Display stages
- Public careers page (unauthenticated)
- Public job details (unauthenticated)

### Hiring Process Tests (12 tests)
- Display hiring processes list
- Display process columns
- Create new hiring process
- View process details
- Display process stages
- Move candidate between stages
- Update process status
- Filter by status
- Search processes
- Display candidate information
- Display job position information
- Add notes to process

### Dashboard Tests (4 tests)
- Display HR dashboard
- Display statistics cards
- Navigate to other pages
- Display recent activity

**Total: 55+ E2E tests**

## Writing New Tests

### Example Test Template
```typescript
import { test, expect } from '@playwright/test';
import { login, TEST_USERS, waitForLoadingComplete } from './fixtures/test-utils';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.HR_ADMIN);
    await page.goto('/your-page');
    await waitForLoadingComplete(page);
  });

  test('should do something', async ({ page }) => {
    // Your test logic
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## Best Practices

1. **Always wait for loading to complete** - Use `waitForLoadingComplete(page)`
2. **Use semantic selectors** - Prefer `[role="button"]`, `[aria-label="..."]` over classes
3. **Handle async properly** - Use `await` for all Playwright actions
4. **Use test data generators** - `generateTestData()` for unique test data
5. **Clean up after tests** - Delete test data when possible
6. **Check for element existence** - Use `await element.count() > 0` before interacting
7. **Use timeouts wisely** - Don't use arbitrary `waitForTimeout`, prefer specific waits
8. **Test real user flows** - Test complete workflows, not isolated actions

## Troubleshooting

### Tests failing with "Element not visible"
- Ensure Docker containers are running
- Check if loading indicators are blocking elements
- Use `waitForLoadingComplete(page)` before interactions

### Login fails
- Verify backend is running: `docker-compose ps`
- Check API is accessible: `curl http://localhost:4000/api/health/liveness`
- Ensure dummy data is seeded

### Timeout errors
- Increase timeout in `playwright.config.ts` if needed
- Check network tab in headed mode to debug slow requests
- Verify Docker containers have enough resources

### Tests pass locally but fail in CI
- Set `retries: 2` in playwright.config.ts for CI
- Use `workers: 1` to avoid race conditions
- Ensure CI has enough memory for browser instances

## Configuration

See `playwright.config.ts` for configuration options:
- Base URL: `http://localhost:3000`
- Timeout: 30s per test
- Browsers: Chromium (default), Firefox, Webkit (optional)
- Screenshots: On failure
- Videos: Retain on failure
- Traces: On first retry

## CI/CD Integration

To run tests in CI:

```yaml
# Example GitHub Actions workflow
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: yarn test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
