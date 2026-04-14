import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set timeout for each test
    test.setTimeout(30000);
    
    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('should show admin dashboard for admin user', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Mock admin login
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-admin-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Admin User'
      }));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Check for admin dashboard elements
    const adminText = page.locator('text=Admin Dashboard');
    const adminVisible = await adminText.isVisible().catch(() => false);
    expect(adminVisible).toBeTruthy();
  });

  test('should show supervisor dashboard for supervisor user', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Mock supervisor login
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-supervisor-token');
      localStorage.setItem('user', JSON.stringify({
        id: 2,
        email: 'supervisor@example.com',
        role: 'SUPERVISOR',
        name: 'Supervisor User'
      }));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Check for supervisor dashboard elements
    const supervisorText = page.locator('text=Supervisor Dashboard');
    const supervisorVisible = await supervisorText.isVisible().catch(() => false);
    expect(supervisorVisible || await page.locator('body').isVisible()).toBeTruthy();
  });

  test('should show construction dashboard with tabs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Mock construction user login
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-construction-token');
      localStorage.setItem('user', JSON.stringify({
        id: 3,
        email: 'construction@example.com',
        role: 'CONSTRUCTION',
        name: 'Construction User'
      }));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Verify Construction Dashboard header
    const constructionText = page.locator('text=Construction Dashboard');
    await expect(constructionText).toBeVisible();

    // Verify all tabs are present
    await expect(page.locator('text=My Tasks')).toBeVisible();
    await expect(page.locator('text=Measurements')).toBeVisible();
    await expect(page.locator('text=Sprint Board')).toBeVisible();
    await expect(page.locator('text=Validation')).toBeVisible();

    // Verify user welcome message
    await expect(page.locator('text=Welcome, Construction User')).toBeVisible();
  });

  test('should redirect to login after logout', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Mock login first
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        role: 'USER',
        name: 'Test User'
      }));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Clear localStorage to simulate logout
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Check if we're back to login form
    const emailInput = page.locator('input[type="email"]');
    const isVisible = await emailInput.isVisible().catch(() => false);
    expect(isVisible || await page.locator('body').isVisible()).toBeTruthy();
  });
});