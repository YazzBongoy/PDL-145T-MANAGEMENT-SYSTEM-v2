import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('should show admin dashboard for admin user', async ({ page }) => {
    await page.goto('/');

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

    await page.reload();

    // Check for admin dashboard elements
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    await expect(page.locator('text=Projects')).toBeVisible();
    await expect(page.locator('text=Resources')).toBeVisible();
  });

  test('should show supervisor dashboard for supervisor user', async ({ page }) => {
    await page.goto('/');

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

    await page.reload();

    // Check for supervisor dashboard elements
    await expect(page.locator('text=Supervisor Dashboard')).toBeVisible();
  });

  test('should show construction dashboard for construction user', async ({ page }) => {
    await page.goto('/');

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

    await page.reload();

    // Check for construction dashboard elements
    await expect(page.locator('text=Construction Dashboard')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/');

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

    await page.reload();

    // Click logout button
    await page.locator('button:has-text("Logout")').click();

    // Should redirect to login form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});