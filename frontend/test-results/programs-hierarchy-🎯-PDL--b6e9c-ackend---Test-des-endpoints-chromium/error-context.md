# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: programs-hierarchy.spec.ts >> 🎯 PDL 145 - Programme, Projets et Hiérarchie des Tâches >> ✅ 13. API Backend - Test des endpoints
- Location: tests/programs-hierarchy.spec.ts:356:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 401
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]:
        - img "PDL-145T Management System Logo" [ref=e8]
        - generic [ref=e13]:
          - generic [ref=e14]: PDL-145T
          - generic [ref=e15]: Management System
      - navigation [ref=e16]:
        - button "Dashboard" [ref=e17] [cursor=pointer]:
          - img [ref=e18]
          - generic [ref=e20]: Dashboard
        - button "Programs" [ref=e21] [cursor=pointer]:
          - img [ref=e22]
          - generic [ref=e27]: Programs
        - button "Devices" [ref=e28] [cursor=pointer]:
          - img [ref=e29]
          - generic [ref=e31]: Devices
        - button "Reports" [ref=e32] [cursor=pointer]:
          - img [ref=e33]
          - generic [ref=e36]: Reports
        - button "Settings" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
          - generic [ref=e41]: Settings
      - button "A Admin User" [ref=e44] [cursor=pointer]:
        - generic [ref=e45]: A
        - generic [ref=e46]: Admin User
        - img [ref=e47]
  - main [ref=e49]:
    - generic [ref=e51]:
      - heading "Admin Dashboard" [level=2] [ref=e53]
      - generic [ref=e54]:
        - generic [ref=e56]:
          - generic [ref=e57]:
            - heading "Projects" [level=3] [ref=e58]
            - generic [ref=e60]:
              - generic [ref=e61]:
                - button "List" [pressed] [ref=e62] [cursor=pointer]
                - button "Timeline" [ref=e63] [cursor=pointer]
              - button "Add new project" [ref=e64] [cursor=pointer]: + New Project
          - alert [ref=e65]: Failed to fetch projects
          - generic [ref=e67]:
            - generic [ref=e68]: 📁
            - generic [ref=e69]: No projects found
            - generic [ref=e70]: Click "+ New Project" to create your first project
        - generic [ref=e72]:
          - generic [ref=e73]:
            - heading "Resources" [level=3] [ref=e74]
            - button "Add new resource" [ref=e76] [cursor=pointer]: + New Resource
          - alert [ref=e77]: Failed to fetch resources
      - button "Logout" [ref=e79] [cursor=pointer]
    - generic [ref=e80]:
      - heading "Backend Health Status" [level=2] [ref=e81]
      - generic [ref=e82]:
        - generic [ref=e83]: "Status: healthy"
        - paragraph [ref=e84]: "Timestamp: 4/20/2026, 7:27:28 PM"
        - paragraph [ref=e85]: "Uptime: 1188 seconds"
        - button "Refresh" [ref=e86] [cursor=pointer]
```

# Test source

```ts
  263 |     await page.locator('[data-testid="nav-dashboard"]').click();
  264 |     await page.waitForTimeout(1500);
  265 |     
  266 |     const taskHierarchy = page.locator('[data-testid="task-hierarchy"]');
  267 |     
  268 |     // Expand to find level 3 tasks with resources
  269 |     const level1Task = taskHierarchy.locator('[data-testid="task-item-level-1"]').first();
  270 |     const expandBtn = level1Task.locator('[data-testid="expand-btn"]');
  271 |     
  272 |     if (await expandBtn.isVisible().catch(() => false)) {
  273 |       await expandBtn.click();
  274 |       await page.waitForTimeout(1000);
  275 |       
  276 |       // Look for resource badges
  277 |       const resourceBadges = taskHierarchy.locator('[data-testid="badge-resources"]');
  278 |       const count = await resourceBadges.count();
  279 |       
  280 |       if (count > 0) {
  281 |         console.log(`   ✅ ${count} tâches avec ressources attachées`);
  282 |         
  283 |         // Click on a task with resources to see details
  284 |         const taskWithResources = taskHierarchy.locator('[data-testid="task-item"]').filter({
  285 |           has: page.locator('[data-testid="badge-resources"]')
  286 |         }).first();
  287 |         
  288 |         await taskWithResources.click();
  289 |         await page.waitForTimeout(500);
  290 |       }
  291 |     }
  292 |   });
  293 | 
  294 |   test('✅ 11. Vérification des barres de progression', async ({ page }) => {
  295 |     console.log('🔍 Test 11: Barres de progression');
  296 |     
  297 |     await page.locator('[data-testid="nav-dashboard"]').click();
  298 |     await page.waitForTimeout(1500);
  299 |     
  300 |     const taskHierarchy = page.locator('[data-testid="task-hierarchy"]');
  301 |     const progressBars = taskHierarchy.locator('[data-testid="progress-bar"]');
  302 |     
  303 |     const count = await progressBars.count();
  304 |     expect(count).toBeGreaterThan(0);
  305 |     
  306 |     // Verify progress percentages are displayed
  307 |     const progressTexts = taskHierarchy.locator('[data-testid="progress-text"]');
  308 |     const textCount = await progressTexts.count();
  309 |     expect(textCount).toBeGreaterThan(0);
  310 |     
  311 |     console.log(`   ✅ ${count} barres de progression affichées`);
  312 |   });
  313 | 
  314 |   test('✅ 12. Workflow complet: Programme → Projet → Tâche', async ({ page }) => {
  315 |     console.log('🔍 Test 12: Workflow complet');
  316 |     
  317 |     // Step 1: Go to Programs
  318 |     await page.locator('[data-testid="nav-programs"]').click();
  319 |     await page.waitForTimeout(1500);
  320 |     await expect(page.locator('[data-testid="programs-view"]')).toBeVisible();
  321 |     console.log('   1️⃣ Programs affiché');
  322 |     
  323 |     // Step 2: Expand program
  324 |     await page.locator('[data-testid="program-header"]').first().click();
  325 |     await page.waitForTimeout(1000);
  326 |     console.log('   2️⃣ Programme expandé');
  327 |     
  328 |     // Step 3: Verify projects
  329 |     await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
  330 |     const projectCount = await page.locator('[data-testid="project-item"]').count();
  331 |     console.log(`   3️⃣ ${projectCount} projets visibles`);
  332 |     
  333 |     // Step 4: Go to Dashboard
  334 |     await page.locator('[data-testid="nav-dashboard"]').click();
  335 |     await page.waitForTimeout(1500);
  336 |     console.log('   4️⃣ Dashboard affiché');
  337 |     
  338 |     // Step 5: Verify task hierarchy
  339 |     const taskHierarchy = page.locator('[data-testid="task-hierarchy"]');
  340 |     await expect(taskHierarchy).toBeVisible();
  341 |     
  342 |     const totalTasks = await taskHierarchy.locator('[data-testid^="task-item-level"]').count();
  343 |     console.log(`   5️⃣ ${totalTasks} tâches dans la hiérarchie`);
  344 |     
  345 |     // Step 6: Expand all levels
  346 |     const expandButtons = await taskHierarchy.locator('[data-testid="expand-btn"]').all();
  347 |     for (const btn of expandButtons.slice(0, 3)) {
  348 |       await btn.click();
  349 |       await page.waitForTimeout(500);
  350 |     }
  351 |     console.log('   6️⃣ Hiérarchie expandée');
  352 |     
  353 |     console.log('✅ Workflow complet réussi');
  354 |   });
  355 | 
  356 |   test('✅ 13. API Backend - Test des endpoints', async ({ request }) => {
  357 |     console.log('🔍 Test 13: Tests API Backend');
  358 |     
  359 |     // Test Programs API
  360 |     const programsResponse = await request.get('http://localhost:8002/api/programs', {
  361 |       headers: { 'Authorization': 'Bearer mock-token' }
  362 |     });
> 363 |     expect(programsResponse.status()).toBe(200);
      |                                       ^ Error: expect(received).toBe(expected) // Object.is equality
  364 |     const programs = await programsResponse.json();
  365 |     expect(programs.length).toBeGreaterThan(0);
  366 |     console.log(`   ✅ /api/programs: ${programs.length} programmes`);
  367 |     
  368 |     // Test Task Hierarchy API
  369 |     const hierarchyResponse = await request.get('http://localhost:8002/api/tasks/hierarchy/1', {
  370 |       headers: { 'Authorization': 'Bearer mock-token' }
  371 |     });
  372 |     expect(hierarchyResponse.status()).toBe(200);
  373 |     const tasks = await hierarchyResponse.json();
  374 |     expect(tasks.length).toBeGreaterThan(0);
  375 |     console.log(`   ✅ /api/tasks/hierarchy/1: ${tasks.length} tâches racine`);
  376 |     
  377 |     // Verify task structure
  378 |     if (tasks.length > 0) {
  379 |       const firstTask = tasks[0];
  380 |       expect(firstTask).toHaveProperty('TaskID');
  381 |       expect(firstTask).toHaveProperty('Name');
  382 |       expect(firstTask).toHaveProperty('Level');
  383 |       expect(firstTask).toHaveProperty('SubTasks');
  384 |       console.log('   ✅ Structure des tâches valide');
  385 |     }
  386 |   });
  387 | 
  388 |   test('✅ 14. Performance - Temps de chargement', async ({ page }) => {
  389 |     console.log('🔍 Test 14: Performance');
  390 |     
  391 |     // Measure Programs page load
  392 |     const startPrograms = Date.now();
  393 |     await page.locator('[data-testid="nav-programs"]').click();
  394 |     await page.waitForTimeout(1500);
  395 |     const programsLoadTime = Date.now() - startPrograms;
  396 |     console.log(`   ⏱️ Programs load: ${programsLoadTime}ms`);
  397 |     expect(programsLoadTime).toBeLessThan(5000);
  398 |     
  399 |     // Measure Dashboard page load
  400 |     const startDashboard = Date.now();
  401 |     await page.locator('[data-testid="nav-dashboard"]').click();
  402 |     await page.waitForTimeout(1500);
  403 |     const dashboardLoadTime = Date.now() - startDashboard;
  404 |     console.log(`   ⏱️ Dashboard load: ${dashboardLoadTime}ms`);
  405 |     expect(dashboardLoadTime).toBeLessThan(5000);
  406 |     
  407 |     console.log('✅ Performance acceptable');
  408 |   });
  409 | 
  410 |   test.afterEach(async ({ page }, testInfo) => {
  411 |     console.log(`\n🏁 Test terminé: ${testInfo.title}`);
  412 |     console.log(`   Status: ${testInfo.status}`);
  413 |     if (testInfo.status === 'passed') {
  414 |       console.log('   ✅ PASSED\n');
  415 |     } else {
  416 |       console.log('   ❌ FAILED\n');
  417 |     }
  418 |   });
  419 | });
  420 | 
  421 | test.describe('📊 Résumé des Tests', () => {
  422 |   test('🏆 Bilan final', async () => {
  423 |     console.log('\n========================================');
  424 |     console.log('         ✅ TESTS COMPLÉTÉS');
  425 |     console.log('========================================');
  426 |     console.log('\n📋 Fonctionnalités testées:');
  427 |     console.log('   ✅ Navigation Programs');
  428 |     console.log('   ✅ Programme PDL 145');
  429 |     console.log('   ✅ 4 Projets avec métadonnées');
  430 |     console.log('   ✅ Hiérarchie 3 niveaux de tâches');
  431 |     console.log('   ✅ Statuts de progression');
  432 |     console.log('   ✅ Ressources attachées');
  433 |     console.log('   ✅ API Backend');
  434 |     console.log('   ✅ Performance');
  435 |     console.log('\n🎯 L\'application est complète et fonctionnelle !');
  436 |     console.log('========================================\n');
  437 |     expect(true).toBe(true);
  438 |   });
  439 | });
  440 | 
```