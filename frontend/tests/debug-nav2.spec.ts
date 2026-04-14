import { test, expect } from '@playwright/test';

test('Navigation test with detailed debug', async ({ page }) => {
  test.setTimeout(60000);
  
  // Listen to console messages
  page.on('console', msg => {
    console.log(`PAGE LOG: ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });
  
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
  
  // Wait for React to hydrate
  await page.waitForTimeout(2000);
  
  // Check localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const user = await page.evaluate(() => localStorage.getItem('user'));
  console.log(`Token: ${token}`);
  console.log(`User: ${user}`);
  
  // Check if main content is visible
  const mainContent = await page.textContent('.auth-section') || 'No content found';
  console.log(`Main content preview: ${mainContent.substring(0, 500)}`);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/debug1.png', fullPage: true });
  
  // Check nav button
  const navButton = page.locator('[data-testid="nav-devices"]');
  const isVisible = await navButton.isVisible().catch(() => false);
  const isEnabled = await navButton.isEnabled().catch(() => false);
  const count = await navButton.count();
  
  console.log(`Nav button - count: ${count}, visible: ${isVisible}, enabled: ${isEnabled}`);
  
  // Get button text
  if (count > 0) {
    const buttonText = await navButton.textContent();
    console.log(`Button text: ${buttonText}`);
    
    // Try clicking with different methods
    console.log('Attempting click...');
    
    // Method 1: Direct click
    await navButton.click();
    await page.waitForTimeout(1000);
    
    // Check if view changed
    let devicesView = page.locator('[data-testid="devices-view"]');
    let devicesVisible = await devicesView.isVisible().catch(() => false);
    console.log(`After direct click - devices view: ${devicesVisible}`);
    
    // If not visible, try clicking again
    if (!devicesVisible) {
      console.log('Trying JavaScript click...');
      
      // Method 2: JavaScript click
      await page.evaluate(() => {
        const button = document.querySelector('[data-testid="nav-devices"]') as HTMLButtonElement;
        if (button) {
          button.click();
          console.log('JavaScript click executed');
        }
      });
      
      await page.waitForTimeout(1000);
      
      devicesVisible = await devicesView.isVisible().catch(() => false);
      console.log(`After JS click - devices view: ${devicesVisible}`);
    }
    
    // Take final screenshot
    await page.screenshot({ path: '/tmp/debug2.png', fullPage: true });
    
    // Get final page text
    const finalText = await page.textContent('body');
    console.log(`Final body text preview: ${finalText?.substring(0, 500)}`);
    
    // Check for devices view text
    const hasDevicesText = finalText?.includes('Devices & Equipment') || false;
    console.log(`Has 'Devices & Equipment' text: ${hasDevicesText}`);
  }
  
  expect(true).toBeTruthy(); // Don't fail, just gather info
});
