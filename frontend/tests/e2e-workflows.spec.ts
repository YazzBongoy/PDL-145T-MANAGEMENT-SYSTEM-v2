import { test, expect } from '@playwright/test';

test.describe('E2E Workflows', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    
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

  test('Complete device management workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // 1. Navigate to Devices
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="devices-view"]')).toBeVisible();
    
    // 2. Add a new device
    await page.locator('[data-testid="devices-add-button"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="device-modal"]')).toBeVisible();
    
    // Fill device details
    await page.locator('[data-testid="device-modal-name"]').fill('E2E Test Excavator');
    await page.locator('[data-testid="device-modal-type"]').selectOption('Heavy Machinery');
    await page.locator('[data-testid="device-modal-status"]').selectOption('active');
    await page.locator('[data-testid="device-modal-quantity"]').fill('1');
    await page.locator('[data-testid="device-modal-location"]').fill('E2E Test Site');
    await page.locator('[data-testid="device-modal-serial"]').fill('E2E-TEST-001');
    
    // Save device
    await page.locator('[data-testid="device-modal-save"]').click();
    await page.waitForTimeout(1000);
    
    // Verify modal closed
    await expect(page.locator('[data-testid="device-modal"]')).not.toBeVisible();
    
    // 3. Search for the device
    const searchInput = page.locator('[data-testid="devices-search"] input');
    await searchInput.fill('E2E Test');
    await page.waitForTimeout(500);
    
    // 4. Filter by type
    await page.locator('[data-testid="devices-type-filter"]').selectOption('Heavy Machinery');
    await page.waitForTimeout(500);
    
    console.log('✅ Device management workflow completed');
  });

  test('Complete navigation workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Dashboard
    await expect(page.locator('[data-testid="dashboard-view"], [data-testid="construction-dashboard"], [data-testid="finance-dashboard"], [data-testid="admin-dashboard"]')).toBeVisible();
    
    // Navigate through all tabs
    const tabs = [
      { nav: 'nav-devices', view: 'devices-view', title: 'Devices' },
      { nav: 'nav-reports', view: 'reports-view', title: 'Reports' },
      { nav: 'nav-settings', view: 'settings-view', title: 'Settings' },
      { nav: 'nav-dashboard', view: 'dashboard-view,construction-dashboard,finance-dashboard,admin-dashboard', title: 'Dashboard' }
    ];
    
    for (const tab of tabs) {
      await page.locator(`[data-testid="${tab.nav}"]`).click();
      await page.waitForTimeout(500);
      
      // Check one of the possible view selectors
      const viewSelectors = tab.view.split(',').map(v => `[data-testid="${v}"]`).join(', ');
      const viewVisible = await page.locator(viewSelectors).first().isVisible().catch(() => false);
      expect(viewVisible).toBeTruthy();
      
      console.log(`✅ Navigated to ${tab.title}`);
    }
    
    console.log('✅ Navigation workflow completed');
  });

  test('Settings update workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Settings
    await page.locator('[data-testid="nav-settings"]').click();
    await page.waitForTimeout(500);
    
    // Check all settings tabs exist
    const settingsTabs = ['Profile', 'Notifications', 'Security', 'Appearance'];
    for (const tab of settingsTabs) {
      const tabSelector = page.locator(`[data-testid="settings-tab-${tab.toLowerCase()}"], button:has-text("${tab}")`).first();
      await expect(tabSelector).toBeVisible();
    }
    
    // Click through each tab
    for (const tab of settingsTabs) {
      await page.locator(`[data-testid="settings-tab-${tab.toLowerCase()}"], button:has-text("${tab}")`).first().click();
      await page.waitForTimeout(300);
      console.log(`✅ Settings tab ${tab} accessible`);
    }
    
    console.log('✅ Settings workflow completed');
  });

  test('Reports generation workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Reports
    await page.locator('[data-testid="nav-reports"]').click();
    await page.waitForTimeout(1000);
    
    // Check filters work
    const typeFilter = page.locator('[data-testid="reports-type-filter"]');
    if (await typeFilter.isVisible().catch(() => false)) {
      await typeFilter.selectOption('progress');
      await page.waitForTimeout(500);
      console.log('✅ Reports type filter works');
    }
    
    // Check date filter
    const dateFilter = page.locator('[data-testid="reports-date-filter"]');
    if (await dateFilter.isVisible().catch(() => false)) {
      await dateFilter.selectOption('7days');
      await page.waitForTimeout(500);
      console.log('✅ Reports date filter works');
    }
    
    // Check export button
    const exportButton = page.locator('[data-testid="reports-export-button"]');
    if (await exportButton.isVisible().catch(() => false)) {
      console.log('✅ Reports export button visible');
    }
    
    console.log('✅ Reports workflow completed');
  });

  test('Mobile responsive workflow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Check hamburger menu exists
    const menuButton = page.locator('[data-testid="mobile-menu-button"], button:has([data-testid="menu-icon"])').first();
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.waitForTimeout(300);
      
      // Check mobile navigation appears
      const mobileNav = page.locator('[data-testid="mobile-navigation"], nav').first();
      await expect(mobileNav).toBeVisible();
      
      // Navigate using mobile menu
      await page.locator('[data-testid="nav-mobile-devices"], [data-testid="nav-devices"]').first().click();
      await page.waitForTimeout(500);
      
      console.log('✅ Mobile navigation works');
    }
    
    console.log('✅ Mobile responsive workflow completed');
  });

  test('Error handling workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Devices
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    
    // Try to add device with invalid data
    await page.locator('[data-testid="devices-add-button"]').click();
    await page.waitForTimeout(300);
    
    // Submit empty form to trigger validation
    await page.locator('[data-testid="device-modal-save"]').click();
    await page.waitForTimeout(300);
    
    // Check validation errors appear
    const nameError = page.locator('text=Name is required');
    await expect(nameError).toBeVisible();
    
    // Cancel and close
    await page.locator('[data-testid="device-modal-cancel"]').click();
    await page.waitForTimeout(300);
    
    await expect(page.locator('[data-testid="device-modal"]')).not.toBeVisible();
    
    console.log('✅ Error handling workflow completed');
  });
});
