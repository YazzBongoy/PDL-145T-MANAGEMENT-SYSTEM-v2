import { test, expect } from '@playwright/test';

test.describe('Devices CRUD Feature', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'CONSTRUCTION',
    name: 'Test User'
  };

  test('should open add device modal', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Click on Devices tab
    const devicesTab = page.locator('[data-testid="nav-devices"]');
    await devicesTab.click();
    await page.waitForTimeout(500);
    
    // Click Add Device button
    const addButton = page.locator('[data-testid="devices-add-button"]');
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Verify modal is open
    const modal = page.locator('[data-testid="device-modal"]');
    await expect(modal).toBeVisible();
    
    // Verify modal title
    await expect(page.locator('text=Add New Device')).toBeVisible();
  });

  test('should validate required fields in add device modal', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Devices
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    
    // Open add modal
    await page.locator('[data-testid="devices-add-button"]').click();
    await page.waitForTimeout(500);
    
    // Click save without filling required fields
    await page.locator('[data-testid="device-modal-save"]').click();
    
    // Verify validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Type is required')).toBeVisible();
  });

  test('should add a new device successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Devices
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    
    // Open add modal
    await page.locator('[data-testid="devices-add-button"]').click();
    await page.waitForTimeout(500);
    
    // Fill form
    await page.locator('[data-testid="device-modal-name"]').fill('Test Excavator');
    await page.locator('[data-testid="device-modal-type"]').selectOption('Heavy Machinery');
    await page.locator('[data-testid="device-modal-status"]').selectOption('active');
    await page.locator('[data-testid="device-modal-quantity"]').fill('2');
    await page.locator('[data-testid="device-modal-location"]').fill('Site A - Zone 1');
    await page.locator('[data-testid="device-modal-serial"]').fill('TEST-001');
    await page.locator('[data-testid="device-modal-cost"]').fill('150000');
    await page.locator('[data-testid="device-modal-purchase-date"]').fill('2024-01-15');
    await page.locator('[data-testid="device-modal-description"]').fill('Test description');
    
    // Save
    await page.locator('[data-testid="device-modal-save"]').click();
    
    // Verify modal closes
    await expect(page.locator('[data-testid="device-modal"]')).not.toBeVisible();
  });

  test('should open edit device modal', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Devices
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(1000);
    
    // Wait for devices to load
    await page.waitForSelector('[data-testid^="device-card-"], [data-testid="devices-empty"]', { timeout: 10000 });
    
    // Check if there are devices
    const deviceCards = page.locator('[data-testid^="device-card-"]');
    const count = await deviceCards.count();
    
    if (count > 0) {
      // Click edit on first device
      const editButton = page.locator('[data-testid="device-edit-button"]').first();
      await editButton.click();
      
      // Verify modal is open with edit title
      const modal = page.locator('[data-testid="device-modal"]');
      await expect(modal).toBeVisible();
      await expect(page.locator('text=Edit Device')).toBeVisible();
    }
  });

  test('should open delete confirmation modal', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Devices
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(1000);
    
    // Wait for devices to load
    await page.waitForSelector('[data-testid^="device-card-"], [data-testid="devices-empty"]', { timeout: 10000 });
    
    // Check if there are devices
    const deviceCards = page.locator('[data-testid^="device-card-"]');
    const count = await deviceCards.count();
    
    if (count > 0) {
      // Click delete on first device
      const deleteButton = page.locator('[data-testid="device-delete-button"]').first();
      await deleteButton.click();
      
      // Verify delete modal is open
      const deleteModal = page.locator('[data-testid="delete-confirm-modal"]');
      await expect(deleteModal).toBeVisible();
      await expect(page.locator('text=Delete Device')).toBeVisible();
    }
  });

  test('should cancel delete operation', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Navigate to Devices
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(1000);
    
    // Wait for devices to load
    await page.waitForSelector('[data-testid^="device-card-"], [data-testid="devices-empty"]', { timeout: 10000 });
    
    // Check if there are devices
    const deviceCards = page.locator('[data-testid^="device-card-"]');
    const count = await deviceCards.count();
    
    if (count > 0) {
      // Click delete on first device
      await page.locator('[data-testid="device-delete-button"]').first().click();
      
      // Click cancel
      await page.locator('[data-testid="delete-modal-cancel"]').click();
      
      // Verify modal closes
      await expect(page.locator('[data-testid="delete-confirm-modal"]')).not.toBeVisible();
    }
  });
});
