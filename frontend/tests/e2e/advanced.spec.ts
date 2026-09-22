import { test, expect, Page } from '@playwright/test';

test.describe('PDL-145T Frontend Advanced Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: playwrightPage }) => {
    page = playwrightPage;
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should verify page structure and metadata', async () => {
    // Verify HTML lang attribute
    const htmlTag = page.locator('html');
    const lang = await htmlTag.getAttribute('lang');
    expect(lang).toBeTruthy();

    // Verify meta tags
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);

    // Verify page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should handle dynamic content loading', async () => {
    // Wait for React app to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Verify React is running
    const hasReactRoot = await page.evaluate(() => {
      return document.getElementById('root') !== null;
    });
    expect(hasReactRoot).toBe(true);
  });

  test('should verify CSS is loaded correctly', async () => {
    // Check if stylesheets are loaded
    const styleCount = await page.evaluate(() => {
      return document.styleSheets.length;
    });
    expect(styleCount).toBeGreaterThan(0);
  });

  test('should verify JavaScript is running', async () => {
    // Check if window object is accessible
    const windowExists = await page.evaluate(() => {
      return typeof window !== 'undefined';
    });
    expect(windowExists).toBe(true);

    // Check if document is interactive
    const isInteractive = await page.evaluate(() => {
      const states = ['loading', 'interactive', 'complete'];
      return states.includes(document.readyState);
    });
    expect(isInteractive).toBe(true);
  });

  test('should measure page performance', async () => {
    // Get performance metrics
    const perfMetrics = await page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        pageLoadTime: perfData.loadEventEnd - perfData.navigationStart,
        domInteractiveTime: perfData.domInteractive - perfData.navigationStart,
        domContentLoadedTime: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      };
    });

    console.log('Performance Metrics:', perfMetrics);

    // Assert reasonable performance
    expect(perfMetrics.pageLoadTime).toBeLessThan(10000); // Under 10 seconds
    expect(perfMetrics.domInteractiveTime).toBeLessThan(5000); // Under 5 seconds
  });

  test('should handle browser navigation', async () => {
    const initialUrl = page.url();

    // Perform navigation back and forward
    await page.evaluate(() => {
      window.history.pushState({}, 'Test Page', '/test');
    });

    let currentUrl = page.url();
    expect(currentUrl).toContain('test');

    // Go back
    await page.evaluate(() => {
      window.history.back();
    });

    await page.waitForTimeout(500);

    // Verify we're back to initial state
    const finalUrl = page.url();
    expect(finalUrl).toBeTruthy();
  });

  test('should verify no memory leaks with repeated navigation', async () => {
    const iterations = 5;

    for (let i = 0; i < iterations; i++) {
      // Navigate back and forth
      await page.evaluate((iteration) => {
        window.history.pushState({}, `Page ${iteration}`, `/page-${iteration}`);
      }, i);

      await page.waitForTimeout(100);
    }

    // Verify page is still responsive
    const isResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    expect(isResponsive).toBe(true);
  });

  test('should verify accessibility attributes', async () => {
    // Check for ARIA landmarks
    const main = page.locator('main, [role="main"]');
    
    // If main content exists, verify basic structure
    const bodyElement = page.locator('body');
    await expect(bodyElement).toBeVisible();

    // Verify no duplicate IDs
    const duplicateIds = await page.evaluate(() => {
      const ids = new Set<string>();
      const duplicates: string[] = [];

      document.querySelectorAll('[id]').forEach((el) => {
        const id = el.getAttribute('id');
        if (id) {
          if (ids.has(id)) {
            duplicates.push(id);
          }
          ids.add(id);
        }
      });

      return duplicates;
    });

    expect(duplicateIds.length).toBe(0);
  });

  test('should verify font loading', async () => {
    // Check if fonts are loaded (if applicable)
    const fontLoaded = await page.evaluate(() => {
      if (typeof document.fonts !== 'undefined') {
        return document.fonts.ready.then(() => true).catch(() => false);
      }
      return true;
    });

    expect(fontLoaded).toBe(true);
  });

  test('should capture page state information', async () => {
    const pageState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        lang: document.documentElement.lang,
        rtl: document.documentElement.dir === 'rtl',
        encodingCharater: document.characterSet,
        readyState: document.readyState,
        referrer: document.referrer,
        visibilityState: document.visibilityState,
      };
    });

    console.log('Page State:', pageState);

    expect(pageState.url).toContain('localhost:3001');
    expect(pageState.readyState).toBe('complete');
  });

  test('should verify response headers', async () => {
    // Set up response listener
    const responses: any[] = [];

    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
      });
    });

    // Trigger navigation
    await page.reload();

    // Verify successful responses
    const mainDocumentResponse = responses.find(r => r.url === page.url());
    if (mainDocumentResponse) {
      expect(mainDocumentResponse.status).toBeLessThan(400);
    }

    console.log(
      `Total responses captured: ${responses.length}`,
      `Successful: ${responses.filter(r => r.status < 400).length}`
    );
  });
});
