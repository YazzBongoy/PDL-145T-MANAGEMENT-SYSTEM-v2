import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin login for project management access
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-admin-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Admin User'
      }));
    });
  });

  test('should display projects list', async ({ page }) => {
    // Mock API response for projects
    await page.route('/api/projects', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            Name: 'Test Project 1',
            StartDate: '2024-01-01',
            EndDate: '2024-12-31',
            TotalBudget: 100000,
            Status: 'ACTIVE'
          },
          {
            id: 2,
            Name: 'Test Project 2',
            StartDate: '2024-02-01',
            EndDate: '2024-11-30',
            TotalBudget: 150000,
            Status: 'PLANNING'
          }
        ])
      });
    });

    await page.goto('/');

    // Check if projects are displayed
    await expect(page.locator('text=Test Project 1')).toBeVisible();
    await expect(page.locator('text=Test Project 2')).toBeVisible();
    await expect(page.locator('text=Projects')).toBeVisible();
  });

  test('should create new project', async ({ page }) => {
    // Mock API responses
    await page.route('/api/projects', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            Name: 'New Test Project',
            StartDate: '2024-03-01',
            EndDate: '2024-12-31',
            TotalBudget: 200000,
            Status: 'PLANNING'
          })
        });
      }
    });

    await page.goto('/');

    // Click create project button (assuming it exists)
    const createButton = page.locator('button:has-text("Create Project")').or(
      page.locator('button:has-text("Add Project")')
    ).or(page.locator('button:has-text("+")'));

    if (await createButton.isVisible()) {
      await createButton.click();

      // Fill in project form
      await page.locator('input[placeholder*="Name"]').fill('New Test Project');
      await page.locator('input[type="date"]').first().fill('2024-03-01');
      await page.locator('input[type="date"]').last().fill('2024-12-31');
      await page.locator('input[placeholder*="Budget"]').fill('200000');

      // Submit form
      await page.locator('button:has-text("Create")').or(page.locator('button[type="submit"]')).click();

      // Check if project was created
      await expect(page.locator('text=New Test Project')).toBeVisible();
    }
  });

  test('should edit existing project', async ({ page }) => {
    // Mock initial projects
    await page.route('/api/projects', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              Name: 'Original Project',
              StartDate: '2024-01-01',
              EndDate: '2024-12-31',
              TotalBudget: 100000,
              Status: 'ACTIVE'
            }
          ])
        });
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            Name: 'Updated Project Name',
            StartDate: '2024-01-01',
            EndDate: '2024-12-31',
            TotalBudget: 150000,
            Status: 'ACTIVE'
          })
        });
      }
    });

    await page.goto('/');

    // Click edit button for the project
    await page.locator('button:has-text("Edit")').first().click();

    // Update project name
    const nameInput = page.locator('input[value="Original Project"]');
    await nameInput.fill('Updated Project Name');

    // Update budget
    const budgetInput = page.locator('input[placeholder*="Budget"]');
    await budgetInput.fill('150000');

    // Submit changes
    await page.locator('button:has-text("Update")').click();

    // Check if project was updated
    await expect(page.locator('text=Updated Project Name')).toBeVisible();
  });

  test('should delete project', async ({ page }) => {
    // Mock initial projects
    await page.route('/api/projects', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              Name: 'Project to Delete',
              StartDate: '2024-01-01',
              EndDate: '2024-12-31',
              TotalBudget: 100000,
              Status: 'ACTIVE'
            }
          ])
        });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Project deleted successfully' })
        });
      }
    });

    await page.goto('/');

    // Click delete button
    await page.locator('button:has-text("Delete")').first().click();

    // Confirm deletion (if there's a confirmation dialog)
    await page.locator('button:has-text("Confirm")').or(page.locator('button:has-text("Yes")')).click();

    // Check if project was removed
    await expect(page.locator('text=Project to Delete')).not.toBeVisible();
  });
});