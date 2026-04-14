import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests (a11y)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        name: 'Test User'
      }));
    });
  });

  test('Dashboard should not have accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.app')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Devices view should not have accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(1000);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="devices-view"]')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Device Modal should be accessible', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    
    await page.locator('[data-testid="devices-add-button"]').click();
    await page.waitForTimeout(500);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="device-modal"]')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Reports view should not have accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="nav-reports"]').click();
    await page.waitForTimeout(1000);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="reports-view"]')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Settings view should not have accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="nav-settings"]').click();
    await page.waitForTimeout(1000);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="settings-view"]')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Navigation should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Check navigation buttons have aria-current
    const dashboardTab = page.locator('[data-testid="nav-dashboard"]');
    await expect(dashboardTab).toHaveAttribute('aria-current', 'page');
    
    // Click devices and check aria-current moved
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(300);
    
    const devicesTab = page.locator('[data-testid="nav-devices"]');
    await expect(devicesTab).toHaveAttribute('aria-current', 'page');
  });

  test('Form inputs should have associated labels', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    
    await page.locator('[data-testid="devices-add-button"]').click();
    await page.waitForTimeout(500);
    
    // Check that inputs have labels
    const nameInput = page.locator('[data-testid="device-modal-name"]');
    const nameLabel = page.locator('label[for="device-name"]');
    
    await expect(nameLabel).toBeVisible();
    await expect(nameInput).toHaveAttribute('id', 'device-name');
  });

  test('Color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations.filter(v => v.id === 'color-contrast')).toEqual([]);
  });

  test('Interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focusedElement).toBeTruthy();
  });

  test('Images should have alt text', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('Page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1
  });
});
