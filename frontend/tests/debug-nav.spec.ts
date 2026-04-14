import { test, expect } from '@playwright/test';

test('Navigation test with debug', async ({ page }) => {
  test.setTimeout(60000);
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  
  // Mock login
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      role: 'CONSTRUCTION',
      name: 'Test User'
    }));
  });
  
  await page.reload({ waitUntil: 'networkidle' });
  
  // Wait a bit for React to hydrate
  await page.waitForTimeout(1000);
  
  // Take screenshot to see current state
  await page.screenshot({ path: '/tmp/before-click.png' });
  
  // Check if nav button exists
  const navButton = page.locator('[data-testid="nav-devices"]');
  const count = await navButton.count();
  console.log(`Nav button count: ${count}`);
  
  if (count === 0) {
    // Log page content for debugging
    const content = await page.content();
    console.log('Page content:', content.substring(0, 2000));
  }
  
  // Try clicking with force option
  await navButton.click({ force: true });
  
  // Wait for navigation
  await page.waitForTimeout(2000);
  
  // Take screenshot after click
  await page.screenshot({ path: '/tmp/after-click.png' });
  
  // Check for devices view
  const devicesView = page.locator('[data-testid="devices-view"]');
  const isVisible = await devicesView.isVisible().catch(() => false);
  
  console.log(`Devices view visible: ${isVisible}`);
  
  // If not visible, check page text
  if (!isVisible) {
    const text = await page.textContent('body');
    console.log('Page text:', text?.substring(0, 1000));
  }
  
  expect(isVisible).toBeTruthy();
});
