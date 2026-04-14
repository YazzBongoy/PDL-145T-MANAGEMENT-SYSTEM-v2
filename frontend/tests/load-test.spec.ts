import { test, expect } from '@playwright/test';

test.describe('Load & Stress Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Admin User'
      }));
    });
  });

  test('Rapid navigation stress test', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const tabs = ['nav-devices', 'nav-reports', 'nav-settings', 'nav-dashboard'];
    const iterations = 10;
    
    console.log('Starting rapid navigation test...');
    
    for (let i = 0; i < iterations; i++) {
      for (const tab of tabs) {
        await page.locator(`[data-testid="${tab}"]`).click();
        // Small delay to simulate rapid clicking
        await page.waitForTimeout(100);
      }
    }
    
    console.log(`✅ Completed ${iterations} rounds of rapid navigation`);
    
    // Verify app is still responsive
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="devices-view"]')).toBeVisible();
  });

  test('Multiple modal open/close cycles', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    
    const cycles = 5;
    
    for (let i = 0; i < cycles; i++) {
      // Open modal
      await page.locator('[data-testid="devices-add-button"]').click();
      await page.waitForSelector('[data-testid="device-modal"]', { timeout: 2000 });
      
      // Fill some data
      await page.locator('[data-testid="device-modal-name"]').fill(`Load Test Device ${i}`);
      await page.locator('[data-testid="device-modal-type"]').selectOption('Tool');
      
      // Close without saving
      await page.locator('[data-testid="device-modal-cancel"]').click();
      await page.waitForSelector('[data-testid="device-modal"]', { state: 'hidden', timeout: 2000 });
    }
    
    console.log(`✅ Completed ${cycles} modal open/close cycles`);
  });

  test('Search performance with typing', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    
    const searchTerms = [
      'excavator',
      'crane',
      'bulldozer',
      'truck',
      'tool',
      'equipment',
      'heavy',
      'machinery',
      'vehicle',
      'safety'
    ];
    
    const searchInput = page.locator('[data-testid="devices-search"] input');
    
    for (const term of searchTerms) {
      await searchInput.fill(term);
      await page.waitForTimeout(300); // Simulate debounce
    }
    
    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);
    
    console.log(`✅ Completed search performance test with ${searchTerms.length} terms`);
  });

  test('Memory leak check - navigation loop', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Get initial memory
    const initialMetrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0
      };
    });
    
    console.log(`Initial memory: ${(initialMetrics.memory / 1024 / 1024).toFixed(2)} MB`);
    
    // Navigate many times
    const iterations = 20;
    const tabs = ['nav-devices', 'nav-reports', 'nav-settings', 'nav-dashboard'];
    
    for (let i = 0; i < iterations; i++) {
      for (const tab of tabs) {
        await page.locator(`[data-testid="${tab}"]`).click();
        await page.waitForTimeout(200);
      }
    }
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if (window.gc) window.gc();
    });
    
    await page.waitForTimeout(1000);
    
    // Get final memory
    const finalMetrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0
      };
    });
    
    console.log(`Final memory: ${(finalMetrics.memory / 1024 / 1024).toFixed(2)} MB`);
    
    // Memory shouldn't have grown by more than 50MB
    const memoryGrowth = finalMetrics.memory - initialMetrics.memory;
    console.log(`Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)} MB`);
    
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB threshold
  });

  test('API response time under load', async ({ request }) => {
    const endpoints = [
      'http://localhost:8002/api/devices',
      'http://localhost:8002/api/reports',
      'http://localhost:8002/api/settings'
    ];
    
    const iterations = 5;
    const responseTimes: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await request.get(endpoint, {
          headers: { 'Authorization': 'Bearer mock-token' }
        });
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        
        expect(responseTime).toBeLessThan(5000); // 5 second max
      }
    }
    
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxTime = Math.max(...responseTimes);
    
    console.log(`API Load Test Results:`);
    console.log(`  Average response time: ${avgTime.toFixed(0)}ms`);
    console.log(`  Max response time: ${maxTime}ms`);
    console.log(`  Total requests: ${responseTimes.length}`);
    
    expect(avgTime).toBeLessThan(3000); // 3 second average
  });

  test('Simultaneous user actions simulation', async ({ browser }) => {
    // Create multiple contexts to simulate multiple users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));
    
    // Set auth for all pages
    for (const page of pages) {
      await page.addInitScript(() => {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          email: 'admin@example.com',
          role: 'ADMIN',
          name: 'Admin User'
        }));
      });
    }
    
    // All users navigate simultaneously
    await Promise.all(pages.map(page => 
      page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
    ));
    
    await Promise.all(pages.map(page => page.waitForTimeout(1000)));
    
    // All users navigate to different sections simultaneously
    const sections = ['nav-devices', 'nav-reports', 'nav-settings'];
    
    await Promise.all(pages.map((page, index) => 
      page.locator(`[data-testid="${sections[index]}"]`).click()
    ));
    
    await Promise.all(pages.map(page => page.waitForTimeout(500)));
    
    console.log('✅ Simultaneous user actions completed');
    
    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));
  });

  test('Large dataset rendering performance', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(1000);
    
    // Measure time to render device cards
    const renderStart = Date.now();
    
    // Wait for device cards or empty state
    await page.waitForSelector('[data-testid^="device-card-"], [data-testid="devices-empty"], [data-testid="devices-loading"]', { timeout: 10000 });
    
    const renderTime = Date.now() - renderStart;
    console.log(`Device list render time: ${renderTime}ms`);
    
    expect(renderTime).toBeLessThan(5000); // Should render within 5 seconds
  });
});
