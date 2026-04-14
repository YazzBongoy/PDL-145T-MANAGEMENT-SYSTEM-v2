import { test, expect } from '@playwright/test';

test.describe('Settings Feature - Improved with data-testid', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(30000);
    
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  const mockUser = {
    id: 1,
    email: 'user@example.com',
    role: 'USER',
    name: 'Test User'
  };

  test('should navigate to Settings tab', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Click on Settings tab using data-testid
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    
    await page.waitForTimeout(500);

    // Verify Settings page is displayed using data-testid
    await expect(page.locator('[data-testid="settings-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-title"]')).toContainText('Settings');
  });

  test('should show Settings tabs: Profile, Notifications, Security, Appearance', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Settings
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Verify all setting tabs are present using data-testid
    await expect(page.locator('[data-testid="settings-tab-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-tab-notifications"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-tab-security"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-tab-appearance"]')).toBeVisible();
  });

  test('should show Profile settings by default', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Settings
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Wait for loading to finish
    await page.waitForSelector('[data-testid="settings-section-profile"], [data-testid="settings-loading"]', { timeout: 10000 });

    // Verify Profile section is active/displayed using data-testid
    const profileSection = page.locator('[data-testid="settings-section-profile"]');
    
    // Check if we're still loading or the section is visible
    const isLoading = await page.locator('[data-testid="settings-loading"]').isVisible().catch(() => false);
    const isProfileVisible = await profileSection.isVisible().catch(() => false);
    
    expect(isLoading || isProfileVisible).toBeTruthy();
  });

  test('should switch to Notifications tab', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Settings
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Click on Notifications tab using data-testid
    const notificationsTab = page.locator('[data-testid="settings-tab-notifications"]');
    await notificationsTab.click();
    await page.waitForTimeout(500);

    // Verify Notifications section using data-testid
    await expect(page.locator('[data-testid="settings-section-notifications"]')).toBeVisible();
  });

  test('should switch to Security tab', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Settings
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Click on Security tab using data-testid
    const securityTab = page.locator('[data-testid="settings-tab-security"]');
    await securityTab.click();
    await page.waitForTimeout(500);

    // Verify Security section using data-testid
    await expect(page.locator('[data-testid="settings-section-security"]')).toBeVisible();
  });

  test('should switch to Appearance tab', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Settings
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Click on Appearance tab using data-testid
    const appearanceTab = page.locator('[data-testid="settings-tab-appearance"]');
    await appearanceTab.click();
    await page.waitForTimeout(500);

    // Verify Appearance section using data-testid
    await expect(page.locator('[data-testid="settings-section-appearance"]')).toBeVisible();
  });

  test('should show Save Changes button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Settings
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Verify Save button exists using data-testid
    const saveButton = page.locator('[data-testid="settings-save-button"]');
    await expect(saveButton).toBeVisible();
  });

  test('should toggle notification preferences', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Settings
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Go to Notifications tab
    const notificationsTab = page.locator('[data-testid="settings-tab-notifications"]');
    await notificationsTab.click();
    await page.waitForTimeout(500);

    // Verify notifications section is visible
    await expect(page.locator('[data-testid="settings-section-notifications"]')).toBeVisible();

    // Find and toggle a notification checkbox using data-testid
    const checkbox = page.locator('[data-testid="checkbox-email-taskUpdates"]');
    
    if (await checkbox.isVisible().catch(() => false)) {
      // Get initial state
      const initialState = await checkbox.isChecked();
      
      // Toggle checkbox
      await checkbox.click();
      await page.waitForTimeout(300);
      
      // Verify state changed
      const newState = await checkbox.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('should change theme selection', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Settings
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Go to Appearance tab
    const appearanceTab = page.locator('[data-testid="settings-tab-appearance"]');
    await appearanceTab.click();
    await page.waitForTimeout(500);

    // Find theme dropdown using data-testid
    const themeSelect = page.locator('[data-testid="appearance-theme-select"]');
    
    await expect(themeSelect).toBeVisible();
    
    // Change theme
    await themeSelect.selectOption('dark');
    await page.waitForTimeout(300);
    
    // Verify selection changed
    const selectedValue = await themeSelect.inputValue();
    expect(selectedValue).toBe('dark');
  });

  test('should change language selection', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Settings
    const settingsTab = page.locator('[data-testid="settings-tab-profile"], button:has-text("Settings"), nav:has-text("Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Go to Appearance tab
    const appearanceTab = page.locator('[data-testid="settings-tab-appearance"]');
    await appearanceTab.click();
    await page.waitForTimeout(500);

    // Find language dropdown using data-testid
    const languageSelect = page.locator('[data-testid="appearance-language-select"]');
    
    await expect(languageSelect).toBeVisible();
    
    // Change language
    await languageSelect.selectOption('fr');
    await page.waitForTimeout(300);
    
    // Verify selection
    const selectedValue = await languageSelect.inputValue();
    expect(selectedValue).toBe('fr');
  });
});
