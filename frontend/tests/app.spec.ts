import { test, expect } from '@playwright/test';

test.describe('PDL-145T Management System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PDL-145T/);
  });

  test('should show login form when not authenticated', async ({ page }) => {
    await page.goto('/');
    // Check if login form elements are visible
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should show register form when register link is clicked', async ({ page }) => {
    await page.goto('/');
    // Click on register link/button
    await page.locator('button:has-text("Create Account")').click();
    // Check if register form elements are visible
    await expect(page.locator('input[placeholder*="email"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
  });

  test('should show dashboard after successful login', async ({ page }) => {
    // This test would need a mock API or test user
    // For now, we'll skip the actual login and focus on UI structure
    await page.goto('/');

    // Mock a successful login by setting localStorage
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        role: 'USER',
        name: 'Test User'
      }));
    });

    // Reload the page to trigger the authentication check
    await page.reload();

    // Check if dashboard elements are visible (this might need adjustment based on actual dashboard)
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should handle login error', async ({ page }) => {
    await page.goto('/');

    // Fill in wrong credentials
    await page.locator('#email').fill('wrong@example.com');
    await page.locator('#password').fill('wrongpassword');

    // Click login button
    await page.locator('button:has-text("Sign In")').click();

    // Check for error message (this will depend on how errors are displayed)
    await expect(page.locator('.alert--error')).toBeVisible();
  });
});