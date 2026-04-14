# Playwright Test Suite - PDL-145T Management System

## Overview
This document describes the comprehensive Playwright end-to-end test suite for the PDL-145T Management System.

## Test Files

### 1. **api.spec.ts** - Backend API Testing
Tests direct API communication with the backend:
- ✅ `GET /api/health` - Health check endpoint
- ✅ `GET /` - Welcome message
- ✅ `POST /auth/register` - User registration
- ✅ `POST /auth/login` - User authentication (valid & invalid credentials)
- ✅ Protected endpoint authentication (401 testing)

**Features:**
- Uses Playwright's `request` API for isolated API testing
- Tests both success and error cases
- Validates response structure and status codes

### 2. **app.spec.ts** - Frontend Application Tests
Basic application functionality:
- ✅ Page load with title verification
- ✅ Login form visibility
- ✅ Register form navigation
- ✅ Dashboard display after mock login
- ✅ Login error handling

**Features:**
- UI element visibility checks
- localStorage mocking for auth state
- Form interaction testing

### 3. **auth.spec.ts** - Authentication Flows
Comprehensive authentication testing:
- ✅ Application loading
- ✅ Login form display (unauthenticated)
- ✅ Register form navigation
- ✅ Logout button visibility (authenticated)
- ✅ Timeout configuration (30s per test)

**Features:**
- localStorage manipulation for auth simulation
- Flexible element matching
- Error handling for missing elements

### 4. **dashboard.spec.ts** - Role-Based Dashboards
Dashboard functionality by user role:
- ✅ Admin dashboard display
- ✅ Supervisor dashboard display
- ✅ Construction user app display
- ✅ Logout redirect behavior

**Features:**
- Role-based UI testing
- Mock authentication setup
- Logout flow verification

### 5. **projects.spec.ts** - Project Management
Project CRUD operations:
- ✅ Display projects list (mocked API)
- ✅ Create new project
- ✅ Edit existing project
- ✅ Delete project

**Features:**
- API route mocking with `page.route()`
- Form filling and submission
- CRUD workflow testing

### 6. **e2e-workflow.spec.ts** - End-to-End Workflows
Complete user journeys:
- ✅ Login → Dashboard → Logout flow
- ✅ API workflow: Project → Task → Measurement
- ✅ Responsive design (mobile viewport)

**Features:**
- Real backend API integration
- Multi-step workflow testing
- Viewport responsiveness testing

### 7. **performance.spec.ts** - Performance Testing
Application performance metrics:
- ✅ Page load time (3s target, 10s max)
- ✅ API response time (<2s)
- ✅ Memory usage (<200MB)
- ✅ Lighthouse-style accessibility checks
- ✅ Console error monitoring

**Features:**
- Performance metrics collection
- Memory heap analysis
- Console error detection
- Accessibility snapshot

### 8. **devices.spec.ts** - Devices & Equipment Feature
Devices management functionality:
- ✅ Navigate to Devices tab
- ✅ Search functionality
- ✅ Status filter (active/maintenance/inactive)
- ✅ Add Device button visibility
- ✅ Device cards display
- ✅ Device status badges
- ✅ Loading state handling
- ✅ Error state handling

**Features:**
- Real backend API integration (`/api/resources`)
- Search and filter testing
- Responsive device cards
- CRUD preparation testing

### 9. **reports.spec.ts** - Reports & Analytics Feature
Reports and analytics functionality:
- ✅ Navigate to Reports tab
- ✅ Report statistics cards
- ✅ Report type filter (Progress/Financial/Resource/Quality)
- ✅ Date range filter (7/30/90 days)
- ✅ Export button visibility
- ✅ Quick report generation buttons
- ✅ Reports list display
- ✅ Role-based access (ADMIN/FINANCE)
- ✅ Report status badges
- ✅ Download ready reports

**Features:**
- Backend integration (`/api/reports`, `/api/metrics`)
- Filter and export testing
- Multi-role access testing

### 10. **settings.spec.ts** - Settings Feature
User settings and preferences:
- ✅ Navigate to Settings tab
- ✅ Four sub-tabs: Profile, Notifications, Security, Appearance
- ✅ Profile settings display
- ✅ Notifications toggle switches
- ✅ Security/password settings
- ✅ Appearance (theme/language)
- ✅ Save Changes button
- ✅ Toggle notification preferences
- ✅ Change theme selection
- ✅ Change language selection
- ✅ Display user info

**Features:**
- Backend integration (`/api/settings`)
- Form interaction testing
- Toggle switches testing
- Dropdown selection testing

### 11. **navigation-tabs.spec.ts** - Navigation Tabs Feature
Main navigation functionality:
- ✅ Show all four tabs (Dashboard/Devices/Reports/Settings)
- ✅ Navigate between all tabs
- ✅ Maintain tab state after reload
- ✅ Active tab highlighting
- ✅ Keyboard navigation accessibility
- ✅ Mobile menu on small screens

**Features:**
- Cross-browser testing
- Responsive design testing
- Accessibility testing

## Test Configuration

### Playwright Config (`playwright.config.ts`)
```typescript
// Key settings:
- Base URL: http://localhost:5173 (frontend)
- API Base URL: http://localhost:8001 (backend)
- Projects: Chromium only (configurable)
- Screenshots: On failure
- Videos: On first retry
- Traces: On first retry
- Web Server: Auto-start with `npm run dev`
- Global Setup: Health check before tests
```

### Test Environment
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **Browser**: Chromium (configurable to Firefox/WebKit)
- **Default Timeout**: 30 seconds per test
- **Retries**: 2 in CI, 0 locally

## Running Tests

### Run All Tests
```bash
cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/frontend
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test api.spec.ts
npx playwright test app.spec.ts
npx playwright test e2e-workflow.spec.ts
```

### Run New Features Tests
```bash
# Run all new feature tests
npx playwright test devices.spec.ts reports.spec.ts settings.spec.ts navigation-tabs.spec.ts

# Or use the convenience script
cd tests && ./run-new-features-tests.sh

# Run individual new feature tests
npx playwright test devices.spec.ts       # Devices & Equipment
npx playwright test reports.spec.ts       # Reports & Analytics
npx playwright test settings.spec.ts      # User Settings
npx playwright test navigation-tabs.spec.ts  # Navigation Tabs
```

### Run with Different Reporters
```bash
npx playwright test --reporter=list    # Terminal output
npx playwright test --reporter=html    # HTML report
npx playwright test --reporter=json    # JSON output
```

### Run in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run in Debug Mode
```bash
npx playwright test --debug
```

### Run in Headed Mode (Visible Browser)
```bash
npx playwright test --headed
```

### Run with Script
```bash
./scripts/run-playwright-tests.sh [test-pattern]
```

## Viewing Reports

### HTML Report
```bash
npx playwright show-report
```

### Report Location
- **Default**: `frontend/playwright-report/index.html`
- **Test Results**: `frontend/test-results/`

## Test Data & Mocking

### API Mocking
Tests use `page.route()` to mock API responses:
```typescript
await page.route('/api/projects', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify([...])
  });
});
```

### Authentication Mocking
Uses localStorage to simulate logged-in state:
```typescript
await page.addInitScript(() => {
  localStorage.setItem('token', 'mock-token');
  localStorage.setItem('user', JSON.stringify({...}));
});
```

## Predefined Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pdl145t.com | Password123! |
| Supervisor | supervisor@pdl145t.com | Password123! |
| Construction | construction@pdl145t.com | Password123! |
| Finance | rl@pdl145t.com | Password123! |
| User | user@pdl145t.com | Password123! |

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Playwright tests
  run: |
    cd frontend
    npx playwright test --reporter=list
- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: frontend/playwright-report/
```

## Troubleshooting

### Common Issues
1. **Backend not responding**: Ensure Docker containers are running
2. **Port conflicts**: Check if ports 5173 and 8001 are available
3. **Browser not found**: Run `npx playwright install`
4. **Timeout errors**: Increase timeout in `playwright.config.ts`

### Debug Steps
1. Check backend health: `curl http://localhost:8001/api/health`
2. Check frontend: `curl http://localhost:5173`
3. Run with `--debug` flag for step-by-step execution
4. View traces in HTML report

## Coverage Areas

| Area | Test Files | Status |
|------|-----------|--------|
| API Endpoints | api.spec.ts | ✅ Covered |
| Authentication | auth.spec.ts, app.spec.ts | ✅ Covered |
| Dashboard | dashboard.spec.ts | ✅ Covered |
| Projects | projects.spec.ts | ✅ Covered |
| E2E Workflows | e2e-workflow.spec.ts | ✅ Covered |
| Performance | performance.spec.ts | ✅ Covered |
| Mobile/Responsive | e2e-workflow.spec.ts | ✅ Covered |

## Maintenance

### Adding New Tests
1. Create new `.spec.ts` file in `frontend/tests/`
2. Import `{ test, expect }` from `@playwright/test`
3. Use `test.describe()` for grouping
4. Add `test.beforeEach()` for common setup
5. Run tests locally before committing

### Updating Tests
- When UI changes, update selectors
- When API changes, update route mocks
- When auth flow changes, update localStorage handling

## Summary

**Total Test Files**: 7  
**Total Test Suites**: 7  
**Estimated Test Count**: ~35 individual tests  
**Coverage**: Frontend UI, Backend API, Authentication, Performance, E2E Workflows

**Status**: ✅ Ready for execution
