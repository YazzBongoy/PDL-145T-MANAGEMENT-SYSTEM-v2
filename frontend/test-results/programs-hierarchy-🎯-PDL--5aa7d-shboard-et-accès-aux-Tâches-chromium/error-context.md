# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: programs-hierarchy.spec.ts >> 🎯 PDL 145 - Programme, Projets et Hiérarchie des Tâches >> ✅ 5. Navigation vers le Dashboard et accès aux Tâches
- Location: tests/programs-hierarchy.spec.ts:121:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="dashboard-view"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="dashboard-view"]')

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
        - button "Dashboard" [active] [ref=e17] [cursor=pointer]:
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
        - paragraph [ref=e84]: "Timestamp: 4/20/2026, 7:27:09 PM"
        - paragraph [ref=e85]: "Uptime: 1169 seconds"
        - button "Refresh" [ref=e86] [cursor=pointer]
```

# Test source

```ts
  29  |     await page.waitForTimeout(1500);
  30  |     
  31  |     // Verify Programs view is displayed
  32  |     await expect(page.locator('[data-testid="programs-view"]')).toBeVisible();
  33  |     
  34  |     console.log('✅ Navigation Programs réussie');
  35  |   });
  36  | 
  37  |   test('✅ 2. Vérification du Programme PDL 145 Territoires', async ({ page }) => {
  38  |     console.log('🔍 Test 2: Vérification Programme PDL 145');
  39  |     
  40  |     await page.locator('[data-testid="nav-programs"]').click();
  41  |     await page.waitForTimeout(1500);
  42  |     
  43  |     // Check program card exists
  44  |     const programCard = page.locator('[data-testid="program-card"]').first();
  45  |     await expect(programCard).toBeVisible();
  46  |     
  47  |     // Verify program name
  48  |     const programName = programCard.locator('[data-testid="program-name"]');
  49  |     await expect(programName).toContainText('PDL 145');
  50  |     
  51  |     // Verify program description
  52  |     const programDesc = programCard.locator('[data-testid="program-description"]');
  53  |     await expect(programDesc).toContainText('territoires');
  54  |     
  55  |     // Verify budget is displayed
  56  |     const programBudget = programCard.locator('[data-testid="program-budget"]');
  57  |     await expect(programBudget).toContainText('50');
  58  |     
  59  |     console.log('✅ Programme PDL 145 vérifié');
  60  |   });
  61  | 
  62  |   test('✅ 3. Expansion des détails du Programme et vérification des Projets', async ({ page }) => {
  63  |     console.log('🔍 Test 3: Expansion Programme et vérification Projets');
  64  |     
  65  |     await page.locator('[data-testid="nav-programs"]').click();
  66  |     await page.waitForTimeout(1500);
  67  |     
  68  |     // Click to expand program
  69  |     const programHeader = page.locator('[data-testid="program-header"]').first();
  70  |     await programHeader.click();
  71  |     await page.waitForTimeout(1000);
  72  |     
  73  |     // Verify projects list is displayed
  74  |     await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
  75  |     
  76  |     // Check for expected projects
  77  |     const projects = [
  78  |       'École Primaire Nyamata',
  79  |       'Centre de Santé Mugunga',
  80  |       'Bâtiment Administratif de Goma',
  81  |       'Lycée de Bukavu'
  82  |     ];
  83  |     
  84  |     for (const projectName of projects) {
  85  |       const projectItem = page.locator('[data-testid="project-item"]').filter({ hasText: projectName });
  86  |       await expect(projectItem).toBeVisible();
  87  |       console.log(`   ✅ Projet trouvé: ${projectName}`);
  88  |     }
  89  |     
  90  |     console.log('✅ Tous les projets sont présents');
  91  |   });
  92  | 
  93  |   test('✅ 4. Vérification des métadonnées des Projets', async ({ page }) => {
  94  |     console.log('🔍 Test 4: Vérification métadonnées projets');
  95  |     
  96  |     await page.locator('[data-testid="nav-programs"]').click();
  97  |     await page.waitForTimeout(1500);
  98  |     
  99  |     // Expand program
  100 |     await page.locator('[data-testid="program-header"]').first().click();
  101 |     await page.waitForTimeout(1000);
  102 |     
  103 |     // Verify project metadata (budget, dates, task count)
  104 |     const firstProject = page.locator('[data-testid="project-item"]').first();
  105 |     
  106 |     // Check budget format
  107 |     const projectBudget = firstProject.locator('[data-testid="project-budget"]');
  108 |     await expect(projectBudget).toBeVisible();
  109 |     
  110 |     // Check dates
  111 |     const projectDates = firstProject.locator('[data-testid="project-dates"]');
  112 |     await expect(projectDates).toBeVisible();
  113 |     
  114 |     // Check task count
  115 |     const projectTasks = firstProject.locator('[data-testid="project-tasks"]');
  116 |     await expect(projectTasks).toBeVisible();
  117 |     
  118 |     console.log('✅ Métadonnées des projets vérifiées');
  119 |   });
  120 | 
  121 |   test('✅ 5. Navigation vers le Dashboard et accès aux Tâches', async ({ page }) => {
  122 |     console.log('🔍 Test 5: Navigation Dashboard et Tâches');
  123 |     
  124 |     // Navigate to Dashboard
  125 |     await page.locator('[data-testid="nav-dashboard"]').click();
  126 |     await page.waitForTimeout(1500);
  127 |     
  128 |     // Verify dashboard is loaded
> 129 |     await expect(page.locator('[data-testid="dashboard-view"]')).toBeVisible();
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
  130 |     
  131 |     // Look for project selection
  132 |     const projectSelector = page.locator('[data-testid="project-selector"]');
  133 |     if (await projectSelector.isVisible().catch(() => false)) {
  134 |       await projectSelector.click();
  135 |       await page.waitForTimeout(500);
  136 |       
  137 |       // Select first project
  138 |       await page.locator('[data-testid="project-option"]').first().click();
  139 |       await page.waitForTimeout(1000);
  140 |     }
  141 |     
  142 |     console.log('✅ Navigation Dashboard réussie');
  143 |   });
  144 | 
  145 |   test('✅ 6. Vérification de la hiérarchie des Tâches - Niveau 1', async ({ page }) => {
  146 |     console.log('🔍 Test 6: Hiérarchie Niveau 1 (Tâches principales)');
  147 |     
  148 |     // Navigate to Dashboard
  149 |     await page.locator('[data-testid="nav-dashboard"]').click();
  150 |     await page.waitForTimeout(1500);
  151 |     
  152 |     // Look for task hierarchy component
  153 |     const taskHierarchy = page.locator('[data-testid="task-hierarchy"]');
  154 |     await expect(taskHierarchy).toBeVisible();
  155 |     
  156 |     // Verify Level 1 tasks exist
  157 |     const level1Tasks = taskHierarchy.locator('[data-testid="task-item-level-1"]');
  158 |     const count = await level1Tasks.count();
  159 |     expect(count).toBeGreaterThan(0);
  160 |     
  161 |     // Verify level indicator
  162 |     const level1Indicator = level1Tasks.first().locator('[data-testid="level-indicator"]');
  163 |     await expect(level1Indicator).toContainText('N1');
  164 |     
  165 |     console.log(`   ✅ ${count} tâches niveau 1 trouvées`);
  166 |   });
  167 | 
  168 |   test('✅ 7. Expansion des Tâches et vérification Niveau 2', async ({ page }) => {
  169 |     console.log('🔍 Test 7: Hiérarchie Niveau 2 (Sous-tâches)');
  170 |     
  171 |     await page.locator('[data-testid="nav-dashboard"]').click();
  172 |     await page.waitForTimeout(1500);
  173 |     
  174 |     const taskHierarchy = page.locator('[data-testid="task-hierarchy"]');
  175 |     
  176 |     // Click expand on first level 1 task
  177 |     const firstLevel1Task = taskHierarchy.locator('[data-testid="task-item-level-1"]').first();
  178 |     const expandBtn = firstLevel1Task.locator('[data-testid="expand-btn"]');
  179 |     
  180 |     if (await expandBtn.isVisible().catch(() => false)) {
  181 |       await expandBtn.click();
  182 |       await page.waitForTimeout(1000);
  183 |       
  184 |       // Verify Level 2 tasks appear
  185 |       const level2Tasks = taskHierarchy.locator('[data-testid="task-item-level-2"]');
  186 |       const count = await level2Tasks.count();
  187 |       expect(count).toBeGreaterThan(0);
  188 |       
  189 |       // Verify level indicator
  190 |       const level2Indicator = level2Tasks.first().locator('[data-testid="level-indicator"]');
  191 |       await expect(level2Indicator).toContainText('N2');
  192 |       
  193 |       console.log(`   ✅ ${count} tâches niveau 2 trouvées`);
  194 |     }
  195 |   });
  196 | 
  197 |   test('✅ 8. Vérification Niveau 3 (Sous-sous-tâches)', async ({ page }) => {
  198 |     console.log('🔍 Test 8: Hiérarchie Niveau 3');
  199 |     
  200 |     await page.locator('[data-testid="nav-dashboard"]').click();
  201 |     await page.waitForTimeout(1500);
  202 |     
  203 |     const taskHierarchy = page.locator('[data-testid="task-hierarchy"]');
  204 |     
  205 |     // Expand level 1
  206 |     const firstLevel1Task = taskHierarchy.locator('[data-testid="task-item-level-1"]').first();
  207 |     const expandBtn1 = firstLevel1Task.locator('[data-testid="expand-btn"]');
  208 |     
  209 |     if (await expandBtn1.isVisible().catch(() => false)) {
  210 |       await expandBtn1.click();
  211 |       await page.waitForTimeout(1000);
  212 |       
  213 |       // Try to expand level 2
  214 |       const firstLevel2Task = taskHierarchy.locator('[data-testid="task-item-level-2"]').first();
  215 |       const expandBtn2 = firstLevel2Task.locator('[data-testid="expand-btn"]');
  216 |       
  217 |       if (await expandBtn2.isVisible().catch(() => false)) {
  218 |         await expandBtn2.click();
  219 |         await page.waitForTimeout(1000);
  220 |         
  221 |         // Verify Level 3 tasks
  222 |         const level3Tasks = taskHierarchy.locator('[data-testid="task-item-level-3"]');
  223 |         const count = await level3Tasks.count();
  224 |         
  225 |         if (count > 0) {
  226 |           const level3Indicator = level3Tasks.first().locator('[data-testid="level-indicator"]');
  227 |           await expect(level3Indicator).toContainText('N3');
  228 |           console.log(`   ✅ ${count} tâches niveau 3 trouvées`);
  229 |         }
```