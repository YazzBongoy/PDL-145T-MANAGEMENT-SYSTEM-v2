# Playwright Frontend Testing Guide

## Overview

Playwright has been successfully configured and tested with the PDL-145T Frontend application running on `http://localhost:3001`.

## Configuration

### Files Created

1. **`playwright.config.ts`** - Main Playwright configuration
   - Base URL: `http://localhost:3001`
   - Supports multiple browsers: Chromium, Firefox, WebKit
   - Mobile device testing support
   - HTML reporting enabled

2. **`tests/e2e/homepage.spec.ts`** - Frontend homepage tests
   - Homepage loading verification
   - HTML structure validation
   - React app initialization checks
   - Console error detection
   - Network response validation

3. **`tests/e2e/interaction.spec.ts`** - Frontend interaction tests
   - Resource loading tests
   - Accessibility verification
   - API connectivity checks
   - Responsive design testing
   - Screenshot capture

4. **`tests/e2e/test-connection.ts`** - Connection test script
   - Simple connectivity verification
   - Quick smoke test for the frontend

## Available Commands

### Run all Playwright tests
```bash
npm run playwright:test
```

### Run tests in headed mode (with visible browser)
```bash
npm run playwright:test:headed
```

### Run tests with debug mode
```bash
npm run playwright:test:debug
```

### Run tests with UI (interactive mode)
```bash
npm run playwright:test:ui
```

### Generate test code automatically (Codegen)
```bash
npm run playwright:codegen
```

## Test Results

✅ **Connection Test Status: PASSED**

```
✓ Successfully connected to frontend at http://localhost:3001
✓ Page loaded and responded correctly
✓ React application is running
✓ All resources loaded successfully
✓ Screenshot captured successfully
```

## Quick Example Test

Here's a simple test you can run immediately:

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  // Navigate to the application
  await page.goto('/');
  
  // Verify page title
  await expect(page).toHaveTitle(/Vite|React|TS/);
  
  // Verify React root element exists
  const root = page.locator('#root');
  await expect(root).toBeVisible();
});
```

## Test Files Structure

```
frontend/
├── playwright.config.ts                    # Playwright configuration
├── tests/
│   ├── e2e/
│   │   ├── homepage.spec.ts               # Homepage tests
│   │   ├── interaction.spec.ts            # Interaction tests
│   │   └── test-connection.ts             # Connection verification
│   ├── .gitignore                         # Test artifacts (ignored)
│   └── ...
```

## Advanced Usage

### Running Specific Test File
```bash
npx playwright test tests/e2e/homepage.spec.ts
```

### Running Tests for Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debugging a Test
```bash
npx playwright test --debug
```

### Generating Test Code
Use Codegen to automatically generate test code:
```bash
npm run playwright:codegen
```

Then interact with the page, and Playwright will generate the test code for you.

## Environment Setup

### Prerequisites
- frontend application running on `http://localhost:3001`
- Docker containers started: `docker compose up --build`

### Browser Compatibility
- ✓ Chromium (Recommended)
- ✓ Firefox
- ✓ WebKit (Safari)
- ✓ Mobile Chrome
- ✓ Mobile Safari

## Artifacts

After running tests, the following directories are created:

- **`test-results/`** - Detailed test results
- **`playwright-report/`** - HTML test report
- **`blob-report/`** - Binary report data
- **Screenshots** - Captured during tests
- **Videos** - Screen recordings (if enabled)

View the HTML report:
```bash
npx playwright show-report
```

## Best Practices

1. **Use Locators** - Use modern locators instead of XPath:
   ```typescript
   page.locator('button:has-text("Submit")')
   page.locator('[data-testid="submit-button"]')
   ```

2. **Wait for Elements** - Let Playwright auto-wait:
   ```typescript
   await page.click('button'); // Automatically waits for button
   ```

3. **Add Test IDs** - Modify React components with test IDs:
   ```tsx
   <button data-testid="submit-btn">Submit</button>
   ```

4. **Organize Tests** - Group related tests with `test.describe()`:
   ```typescript
   test.describe('Dashboard', () => {
     test('should load', async () => {...});
     test('should display data', async () => {...});
   });
   ```

## Troubleshooting

### Timeout Issues
If tests timeout waiting for elements:
```typescript
await page.goto('/', { timeout: 60000 }); // Increase timeout
```

### Browser Not Found
If browser binaries are missing:
```bash
npx playwright install
```

### Port Already in Use
Ensure the frontend is running:
```bash
docker ps | grep pdl-frontend
```

## API Documentation

For more information, visit:
- [Playwright Official Docs](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locator Strategies](https://playwright.dev/docs/locators)

## Next Steps

1. ✅ Playwright is configured and tested
2. ✅ Basic test files are in place
3. ⏭️ Build out additional test scenarios
4. ⏭️ Integrate with CI/CD pipeline
5. ⏭️ Add visual regression testing
6. ⏭️ Add performance testing

## Support

For issues or questions:
- Check Playwright logs: Look in `test-results/` directory
- Enable debug mode: `PWDEBUG=1 npm run playwright:test`
- Review test traces: Captured in `blob-report/`
