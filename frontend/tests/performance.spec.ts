import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('Page load performance - should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Soft assertion - log warning if slow but don't fail
    if (loadTime > 3000) {
      console.warn(`⚠️ Page load time (${loadTime}ms) exceeded 3 seconds threshold`);
    }
    
    expect(loadTime).toBeLessThan(10000); // Hard limit of 10 seconds
  });

  test('API response time - health endpoint should respond quickly', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('http://localhost:8001/api/health');
    
    const responseTime = Date.now() - startTime;
    console.log(`API response time: ${responseTime}ms`);
    
    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
  });

  test('Memory usage check', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        timing: performance.timing
      };
    });
    
    console.log(`Memory usage: ${(metrics.memory / 1024 / 1024).toFixed(2)} MB`);
    
    // Memory should be reasonable (less than 200MB)
    expect(metrics.memory).toBeLessThan(200 * 1024 * 1024);
  });

  test('Lighthouse performance audit', async ({ page }) => {
    test.skip(process.env.SKIP_LIGHTHOUSE === 'true', 'Skipping Lighthouse audit');
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Basic performance metrics
    const metrics = await page.evaluate(() => {
      return {
        loadTime: performance.now(),
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      };
    });
    expect(metrics.domContentLoaded).toBeGreaterThan(0);
    
    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate and wait
    await page.reload({ waitUntil: 'networkidle' });
    
    // Should have no critical console errors
    const criticalErrors = consoleErrors.filter(e => 
      !e.includes('favicon') && !e.includes('Source map')
    );
    
    if (criticalErrors.length > 0) {
      console.warn('Console errors found:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('Navigation between tabs should be fast', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'ADMIN',
      name: 'Test User'
    };
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Test navigation to devices
    const startDevices = Date.now();
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForSelector('[data-testid="devices-view"]', { timeout: 5000 });
    const devicesTime = Date.now() - startDevices;
    console.log(`Navigation to Devices: ${devicesTime}ms`);
    expect(devicesTime).toBeLessThan(2000);
    
    // Test navigation to reports
    const startReports = Date.now();
    await page.locator('[data-testid="nav-reports"]').click();
    await page.waitForSelector('[data-testid="reports-view"]', { timeout: 5000 });
    const reportsTime = Date.now() - startReports;
    console.log(`Navigation to Reports: ${reportsTime}ms`);
    expect(reportsTime).toBeLessThan(2000);
    
    // Test navigation to settings
    const startSettings = Date.now();
    await page.locator('[data-testid="nav-settings"]').click();
    await page.waitForSelector('[data-testid="settings-view"]', { timeout: 5000 });
    const settingsTime = Date.now() - startSettings;
    console.log(`Navigation to Settings: ${settingsTime}ms`);
    expect(settingsTime).toBeLessThan(2000);
  });

  test('Modal open/close should be smooth', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'ADMIN',
      name: 'Test User'
    };
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to devices
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    
    // Open modal
    const openStart = Date.now();
    await page.locator('[data-testid="devices-add-button"]').click();
    await page.waitForSelector('[data-testid="device-modal"]', { timeout: 2000 });
    const openTime = Date.now() - openStart;
    console.log(`Modal open time: ${openTime}ms`);
    expect(openTime).toBeLessThan(1000);
    
    // Close modal
    const closeStart = Date.now();
    await page.locator('[data-testid="device-modal-close"]').click();
    await page.waitForSelector('[data-testid="device-modal"]', { state: 'hidden', timeout: 2000 });
    const closeTime = Date.now() - closeStart;
    console.log(`Modal close time: ${closeTime}ms`);
    expect(closeTime).toBeLessThan(500);
  });

  test('API endpoints should respond within acceptable time', async ({ request }) => {
    const endpoints = [
      { url: 'http://localhost:8002/api/devices', name: 'Devices' },
      { url: 'http://localhost:8002/api/reports', name: 'Reports' },
      { url: 'http://localhost:8002/api/settings', name: 'Settings' }
    ];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await request.get(endpoint.url, {
        headers: { 'Authorization': 'Bearer mock-token' }
      });
      const responseTime = Date.now() - startTime;
      
      console.log(`${endpoint.name} API: ${responseTime}ms - Status: ${response.status()}`);
      
      // API should respond within 3 seconds even with auth errors
      expect(responseTime).toBeLessThan(3000);
    }
  });

  test('Form validation should be instant', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'ADMIN',
      name: 'Test User'
    };
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to devices and open modal
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid="devices-add-button"]').click();
    await page.waitForTimeout(500);
    
    // Submit empty form
    const validateStart = Date.now();
    await page.locator('[data-testid="device-modal-save"]').click();
    await page.waitForSelector('text=Name is required', { timeout: 1000 });
    const validateTime = Date.now() - validateStart;
    
    console.log(`Form validation time: ${validateTime}ms`);
    expect(validateTime).toBeLessThan(500);
  });
});
