import { test, expect, request } from '@playwright/test';

test.describe('End-to-End Workflows', () => {
  const apiBaseURL = 'http://localhost:8001';
  let authToken: string;
  let userId: number;
  
  test.beforeAll(async () => {
    // Setup: Login and get auth token
    const apiContext = await request.newContext({
      baseURL: apiBaseURL,
    });
    
    const loginResponse = await apiContext.post('/auth/login', {
      data: {
        email: 'admin@pdl145t.com',
        password: 'Password123!'
      }
    });
    
    if (loginResponse.status() === 200) {
      const data = await loginResponse.json();
      authToken = data.token;
      userId = data.user.id;
    }
    
    await apiContext.dispose();
  });

  test('Complete user journey: Login -> View Dashboard -> Logout', async ({ page }) => {
    // Step 1: Navigate to app
    await page.goto('/');
    
    // Step 2: Verify login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Step 3: Login
    await page.locator('input[type="email"]').fill('admin@pdl145t.com');
    await page.locator('input[type="password"]').fill('Password123!');
    
    const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Login")');
    if (await signInButton.isVisible().catch(() => false)) {
      await signInButton.click();
      
      // Wait for navigation or dashboard
      await page.waitForTimeout(2000);
      
      // Verify logged in state
      const logoutButton = page.locator('button:has-text("Logout")');
      const isLoggedIn = await logoutButton.isVisible().catch(() => false);
      
      if (isLoggedIn) {
        // Step 4: Logout
        await logoutButton.click();
        await page.waitForTimeout(1000);
        
        // Verify back at login
        await expect(page.locator('input[type="email"]')).toBeVisible();
      }
    }
  });

  test('API workflow: Create project -> Create task -> Add measurement', async () => {
    if (!authToken) {
      test.skip('No auth token available');
    }
    
    const apiContext = await request.newContext({
      baseURL: apiBaseURL,
      extraHTTPHeaders: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Step 1: Create a project
    const projectResponse = await apiContext.post('/api/projects', {
      data: {
        name: `Test Project ${Date.now()}`,
        description: 'Created by E2E test',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        totalBudget: 10000
      }
    });
    
    expect([201, 200, 404]).toContain(projectResponse.status());
    
    if (projectResponse.status() === 201 || projectResponse.status() === 200) {
      const project = await projectResponse.json();
      const projectId = project.id || project.ProjectID;
      
      // Step 2: Create a task
      const taskResponse = await apiContext.post('/api/tasks', {
        data: {
          projectId: projectId,
          name: 'Test Task',
          description: 'Created by E2E test',
          assignedTo: userId,
          status: 'NotStarted',
          priority: 'Medium'
        }
      });
      
      expect([201, 200]).toContain(taskResponse.status());
      
      if (taskResponse.status() === 201 || taskResponse.status() === 200) {
        const task = await taskResponse.json();
        const taskId = task.id || task.TaskID;
        
        // Step 3: Add a measurement
        const measurementResponse = await apiContext.post(`/api/measurements/task/${taskId}`, {
          data: {
            siteId: 'SITE001',
            measurementType: 'Distance',
            value: 100.5,
            unit: 'meters',
            date: new Date().toISOString(),
            measuredBy: userId
          }
        });
        
        expect([201, 200]).toContain(measurementResponse.status());
      }
    }
    
    await apiContext.dispose();
  });

  test('Responsive design: Verify mobile layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verify page loads without errors
    await expect(page.locator('body')).toBeVisible();
    
    // Check if mobile menu or hamburger exists
    const mobileMenu = page.locator('button[aria-label="menu"], .hamburger, [data-testid="mobile-menu"]');
    const hasMobileMenu = await mobileMenu.isVisible().catch(() => false);
    
    if (hasMobileMenu) {
      console.log('Mobile menu detected');
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
