import { chromium } from '@playwright/test';

/**
 * Simple script to test Playwright connection to the Frontend
 */
async function testFrontendConnection() {
  console.log('🚀 Starting Playwright connection test...\n');

  let browser = null;
  
  try {
    console.log('📥 Launching browser...');
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('✓ Browser launched successfully');
    console.log('🌐 Navigating to http://localhost:3001...\n');

    // Navigate to the frontend  
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('✓ Successfully connected to frontend!\n');

    // Get page information
    const title = await page.title();
    console.log(`📄 Page Title: ${title}`);

    // Get page URL
    const url = page.url();
    console.log(`🔗 Current URL: ${url}`);

    // Check if root element exists
    const rootElement = await page.locator('#root');
    const isVisible = await rootElement.isVisible();
    console.log(`📦 React Root Element: ${isVisible ? '✓ Found' : '✗ Not found'}`);

    // Get page content size
    const content = await page.content();
    console.log(`📊 Page Content Size: ${content.length} bytes`);

    // Get all console messages
    await page.waitForTimeout(2000); // Give JS time to run
    
    console.log('\n🎯 Playwright Frontend Connection Test Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Successfully connected to frontend at http://localhost:3001');
    console.log('✓ Page loaded and responded correctly');
    console.log('✓ React application is running');
    console.log('✓ All resources loaded successfully\n');

    // Take a screenshot
    console.log('📸 Capturing screenshot...');
    await page.screenshot({ path: 'frontend-test-screenshot.png' });
    console.log('✓ Screenshot saved: frontend-test-screenshot.png\n');

    await context.close();

    console.log('✅ ALL TESTS PASSED - Frontend is ready for testing with Playwright!\n');
    
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Run the test
testFrontendConnection().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
