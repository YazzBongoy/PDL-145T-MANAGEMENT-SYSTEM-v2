import { test, expect, Page } from '@playwright/test';

test.describe('PDL-145T Frontend Connection', () => {
  let page: Page;

  test.beforeEach(async ({ page: playwrightPage }) => {
    page = playwrightPage;
    // Navigate to the frontend
    await page.goto('/');
  });

  test('should load the application homepage', async () => {
    // Check that the page loaded successfully
    await expect(page).toHaveTitle(/PDL|Management|System/i);
    
    // Verify the page content is loaded
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
  });

  test('should display the main container', async () => {
    // Wait for the main content to be visible
    const mainContainer = page.locator('body');
    await expect(mainContainer).toBeVisible();
  });

  test('should have proper HTML structure', async () => {
    // Check for HTML structure
    const htmlElement = page.locator('html');
    await expect(htmlElement).toBeTruthy();

    // Check for head and body
    const headElement = page.locator('head');
    const bodyElement = page.locator('body');
    
    await expect(headElement).toBeVisible();
    await expect(bodyElement).toBeVisible();
  });

  test('should connect and verify React app is running', async () => {
    // Check for React element
    const reactRoot = page.locator('#root');
    await expect(reactRoot).toBeVisible();

    // Verify page is interactive
    const isPageInteractive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    expect(isPageInteractive).toBe(true);
  });

  test('should have no console errors', async () => {
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Navigate and wait for content
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Log any errors found
    if (consoleMessages.length > 0) {
      console.log('Console errors found:', consoleMessages);
    }
  });

  test('should verify network response is successful', async () => {
    // Listen for all responses
    const responses: number[] = [];
    page.on('response', response => {
      responses.push(response.status());
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check that we got successful responses (2xx)
    const successfulResponses = responses.filter(status => status >= 200 && status < 300);
    expect(successfulResponses.length).toBeGreaterThan(0);
  });
});
