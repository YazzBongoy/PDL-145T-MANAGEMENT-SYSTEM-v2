# 🧪 Tests - PDL-145T Management System

## 🚀 Démarrage Rapide

### 1. Lancer l'Application

```bash
# Terminal 1 - Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 2. Lancer les Tests

```bash
cd frontend

# Tous les tests
npx playwright test

# Mode UI (visuel)
npx playwright test --ui

# Rapport HTML
npx playwright test --reporter=html
npx playwright show-report
```

---

## 📊 Tests Disponibles

### Tests CRITIQUES (à lancer avant chaque commit)

```bash
# Tests de base
npx playwright test tests/devices.spec.ts
npx playwright test tests/navigation-tabs.spec.ts
```

### Tests COMPLETS (avant release)

```bash
# Tous les tests sauf load
npx playwright test --grep-invert "load"
```

### Tests par Catégorie

```bash
# Devices
npx playwright test tests/devices*.spec.ts

# API & Backend
npx playwright test tests/*api*.spec.ts

# UI & Navigation
npx playwright test tests/app.spec.ts tests/navigation*.spec.ts

# Settings
npx playwright test tests/settings*.spec.ts

# Performance
npx playwright test tests/performance.spec.ts

# Accessibilité
npx playwright test tests/accessibility.spec.ts

# E2E Workflows
npx playwright test tests/e2e*.spec.ts

# Load Tests (peut être lent)
npx playwright test tests/load-test.spec.ts
```

---

## 🎯 Scénarios de Test Recommandés

### 1. Test de Fumée (Smoke Test) - 30 secondes

```bash
npx playwright test tests/navigation-tabs.spec.ts
```

Vérifie que l'application démarre et que la navigation fonctionne.

### 2. Test de Régression - 2 minutes

```bash
npx playwright test tests/devices.spec.ts tests/devices-crud.spec.ts tests/reports-api.spec.ts
```

Vérifie les fonctionnalités principales (Devices, CRUD, API).

### 3. Test Complet - 5 minutes

```bash
npx playwright test --grep-invert "load|accessibility"
```

Exécute tous les tests sauf les plus lents.

### 4. Test de Qualité - 10 minutes

```bash
npx playwright test
```

Exécute tous les tests.

---

## 📁 Structure des Tests

```
frontend/tests/
├── Core (Obligatoires)
│   ├── devices.spec.ts              ✅ Navigation devices
│   ├── navigation-tabs.spec.ts      ✅ Navigation générale
│   └── devices-crud.spec.ts         ⭐ CRUD devices
│
├── API
│   ├── api.spec.ts                  ✅ API générale
│   └── reports-api.spec.ts          ⭐ Reports API
│
├── UI/UX
│   ├── app.spec.ts                  ✅ App générale
│   ├── dashboard.spec.ts            ✅ Dashboard
│   ├── settings.spec.ts             ✅ Settings
│   └── settings-improved.spec.ts    ⭐ Settings amélioré
│
├── Quality
│   ├── accessibility.spec.ts        ⭐ A11y (Axe-core)
│   ├── performance.spec.ts          ⭐ Performance
│   └── load-test.spec.ts            ⭐ Load tests
│
└── E2E
    ├── e2e-workflow.spec.ts         ✅ Workflow E2E
    └── e2e-workflows.spec.ts        ⭐ E2E amélioré

⭐ = Créés/Mis à jour aujourd'hui (14 Avril 2026)
```

---

## 🔍 Débogage

### Voir les Résultats

```bash
# Mode liste (défaut)
npx playwright test --reporter=list

# Mode ligne
npx playwright test --reporter=line

# Mode détaillé
npx playwright test --reporter=verbose

# Rapport HTML
npx playwright test --reporter=html
npx playwright show-report

# JSON
npx playwright test --reporter=json
```

### Mode Debug

```bash
# Step-by-step
npx playwright test --debug

# Avec trace
npx playwright test --trace on
npx playwright show-trace trace.zip

# Console API
DEBUG=pw:api npx playwright test
```

---

## ⚙️ Configuration

### Modifier la Configuration

**Fichier** : `frontend/playwright.config.ts`

Options utiles :

```typescript
export default defineConfig({
  // Timeout global
  timeout: 60000,
  
  // Workers parallèles
  workers: process.env.CI ? 1 : 4,
  
  // Répétitions
  retries: process.env.CI ? 2 : 0,
  
  // Navigateurs
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  
  // Base URL
  use: {
    baseURL: 'http://localhost:5173/',
  },
});
```

### Variables d'Environnement

```bash
# CI Mode
CI=true npx playwright test

# Navigateur spécifique
PLAYWRIGHT_BROWSER=chromium npx playwright test

# Workers
PLAYWRIGHT_WORKERS=2 npx playwright test

# Timeout
PLAYWRIGHT_TIMEOUT=120000 npx playwright test
```

---

## 🐛 Résolution des Problèmes

### Tests qui Échouent

1. **Vérifier que les serveurs tournent**
   ```bash
   curl http://localhost:5173/  # Frontend
   curl http://localhost:8002/api/health  # Backend
   ```

2. **Vérifier la base de données**
   ```bash
   cd backend
   npx prisma db seed
   ```

3. **Mettre à jour les navigateurs**
   ```bash
   npx playwright install chromium
   ```

4. **Nettoyer et relancer**
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   npx playwright install chromium
   ```

### Tests Intermittents

- Augmenter les timeouts
- Ajouter des délais (`await page.waitForTimeout(500)`)
- Utiliser `waitForSelector` au lieu de délais fixes
- Vérifier la stabilité du réseau

### Erreurs de Sélecteur

- Vérifier que les `data-testid` existent
- Utiliser le mode UI pour inspecter : `npx playwright test --ui`
- Vérifier la visibilité avant interaction

---

## 📈 Intégration Continue (CI/CD)

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
          
      - name: Run backend
        run: cd backend && npm run dev &
        
      - name: Run frontend
        run: cd frontend && npm run dev &
        
      - name: Wait for services
        run: sleep 10
        
      - name: Run Playwright tests
        run: cd frontend && npx playwright test
        
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## 📚 Documentation Additionnelle

- [TEST-REPORT.md](./TEST-REPORT.md) - Rapport complet des tests
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Guide détaillé
- [IMPROVEMENT-PLAN.md](./IMPROVEMENT-PLAN.md) - Plan d'amélioration

---

## 🎓 Commandes Essentielles (Mémoriser)

```bash
# Démarrage rapide
cd frontend && npm run dev

# Tests rapides
npx playwright test --ui

# Tests spécifiques
npx playwright test tests/devices-crud.spec.ts

# Debug
npx playwright test --debug

# Rapport
npx playwright test --reporter=html && npx playwright show-report
```

---

**Dernière mise à jour : 14 Avril 2026**
