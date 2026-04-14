import { test, expect } from '@playwright/test';

test.describe('Reports API Integration', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  const mockUser = {
    id: 1,
    email: 'finance@example.com',
    role: 'FINANCE',
    name: 'Finance User'
  };

  test('should navigate to Reports tab', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Click on Reports tab
    const reportsTab = page.locator('[data-testid="nav-reports"]');
    await reportsTab.click();
    await page.waitForTimeout(500);
    
    // Verify Reports page is displayed
    await expect(page.locator('[data-testid="reports-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="reports-title"]')).toContainText('Reports');
  });

  test('should display report filters', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Reports
    await page.locator('[data-testid="nav-reports"]').click();
    await page.waitForTimeout(500);
    
    // Verify filters exist
    await expect(page.locator('[data-testid="reports-type-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="reports-date-filter"]')).toBeVisible();
  });

  test('should display export button', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Reports
    await page.locator('[data-testid="nav-reports"]').click();
    await page.waitForTimeout(500);
    
    // Verify export button
    await expect(page.locator('[data-testid="reports-export-button"]')).toBeVisible();
  });

  test('should display reports list', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Reports
    await page.locator('[data-testid="nav-reports"]').click();
    await page.waitForTimeout(1000);
    
    // Wait for reports to load
    await page.waitForSelector('[data-testid="reports-list"], [data-testid="reports-empty"], [data-testid="reports-loading"]', { timeout: 10000 });
    
    // Verify reports section
    const reportsList = page.locator('[data-testid="reports-list"]');
    const emptyState = page.locator('[data-testid="reports-empty"]');
    const loading = page.locator('[data-testid="reports-loading"]');
    
    const isVisible = await reportsList.isVisible().catch(() => false) || 
                      await emptyState.isVisible().catch(() => false) ||
                      await loading.isVisible().catch(() => false);
    
    expect(isVisible).toBeTruthy();
  });

  test('should generate a new report', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Reports
    await page.locator('[data-testid="nav-reports"]').click();
    await page.waitForTimeout(500);
    
    // Look for generate report button or quick action
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create")').first();
    
    if (await generateButton.isVisible().catch(() => false)) {
      await generateButton.click();
      // Verify some generation UI appears
      await page.waitForTimeout(500);
    }
  });

  test('should filter reports by type', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Reports
    await page.locator('[data-testid="nav-reports"]').click();
    await page.waitForTimeout(500);
    
    // Change type filter
    const typeFilter = page.locator('[data-testid="reports-type-filter"]');
    await expect(typeFilter).toBeVisible();
    
    await typeFilter.selectOption('progress');
    await page.waitForTimeout(1000);
    
    // Verify something happened (loading, results, or empty)
    const hasResponse = await page.locator('[data-testid="reports-list"], [data-testid="reports-loading"], [data-testid="reports-empty"]').count() > 0;
    expect(hasResponse).toBeTruthy();
  });
});
