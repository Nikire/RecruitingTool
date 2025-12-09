# Recruiting Tool Frontend

React + TypeScript + Vite frontend for the Recruiting Tool application.

## E2E Testing

End-to-end tests are implemented using [Playwright](https://playwright.dev/) to test critical user flows against running Docker containers.

### Prerequisites

- Docker containers must be running (`docker-compose up -d`)
- Frontend available at `http://localhost:3000`
- Backend API available at `http://localhost:4000/api`

### Running Tests

```bash
# Run all E2E tests
yarn test:e2e

# Run tests with UI mode (interactive)
yarn test:e2e:ui

# Run specific test file
yarn test:e2e e2e/auth.spec.ts

# Run tests in headed mode (see browser)
yarn test:e2e --headed
```

### Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Video Recordings

All tests record video by default. Videos are saved in:

```
test-results/
├── auth-Authentication-Flow-*/video.webm
├── candidates-Candidates-Management-*/video.webm
├── hiring-process-Hiring-Process-*/video.webm
└── job-positions-Job-Positions-*/video.webm
```

### Test Structure

```
e2e/
├── auth.spec.ts           # Authentication flows (login, logout, session)
├── candidates.spec.ts     # Candidate CRUD operations
├── job-positions.spec.ts  # Job position management
├── hiring-process.spec.ts # Hiring workflow and dashboard
└── fixtures/
    └── test-utils.ts      # Shared test utilities and helpers
```

### Configuration

Playwright configuration is in `playwright.config.ts`:

- **Timeout**: 30 seconds per test
- **Video**: Records all tests (`video: 'on'`)
- **Screenshots**: On failure only
- **Parallel**: Tests run in parallel using 6 workers
- **Browser**: Chromium (Desktop Chrome)

### Writing New Tests

```typescript
import { test, expect } from '@playwright/test';
import { login, waitForPageLoad } from './fixtures/test-utils';

test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page); // Login before each test
  });

  test('should do something', async ({ page }) => {
    await page.goto('/feature');
    await waitForPageLoad(page);
    await expect(page.locator('h1')).toContainText('Expected Title');
  });
});
```

---

## Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
