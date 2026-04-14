# 🧪 Guide Complet de Testing - PDL-145T Management System

## 📖 Table des Matières

1. [Introduction](#introduction)
2. [Configuration de l'Environnement](#configuration)
3. [Types de Tests](#types-de-tests)
4. [Exécution des Tests](#exécution)
5. [Création de Nouveaux Tests](#création)
6. [Dépannage](#dépannage)
7. [Bonnes Pratiques](#bonnes-pratiques)

---

## Introduction {#introduction}

Ce guide explique comment tester l'application PDL-145T Management System à l'aide de Playwright.

### Prérequis

- Node.js 18+
- npm ou yarn
- Navigateur Chrome/Chromium
- Application frontend/backend démarrée

---

## Configuration de l'Environnement {#configuration}

### 1. Installation

```bash
cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/frontend

# Installer les dépendances
npm install

# Installer Playwright et navigateurs
npx playwright install chromium
```

### 2. Configuration des URLs

Les tests utilisent par défaut :
- **Frontend** : `http://localhost:5173/`
- **Backend** : `http://localhost:8002/api/`

Pour modifier, éditer `playwright.config.ts` :

```typescript
use: {
  baseURL: 'http://localhost:5173/',
}
```

### 3. Préparation des Données de Test

```bash
# Seeder la base de données
cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/backend
npx ts-node scripts/seed-test-data.ts
```

---

## Types de Tests {#types-de-tests}

### 1. Tests Unitaires (Jest)

**Emplacement** : `frontend/src/**/*.test.tsx`

```bash
# Lancer tous les tests unitaires
npm test

# Mode watch
npm test -- --watch

# Couverture
npm test -- --coverage
```

### 2. Tests E2E (Playwright)

**Emplacement** : `frontend/tests/*.spec.ts`

#### Catégories de Tests :

| Catégorie | Fichier | Nombre | Description |
|-----------|---------|--------|-------------|
| **Navigation** | `devices.spec.ts`, `navigation-tabs.spec.ts` | 14 | Navigation entre onglets |
| **CRUD** | `devices-crud.spec.ts` | 6 | Create, Read, Update, Delete |
| **API** | `reports-api.spec.ts`, `api.spec.ts` | 12 | Intégration backend |
| **Accessibilité** | `accessibility.spec.ts` | 11 | WCAG, ARIA, keyboard |
| **Performance** | `performance.spec.ts` | 9 | Temps de réponse, mémoire |
| **E2E Workflows** | `e2e-workflows.spec.ts` | 6 | Scénarios complets |
| **Load Tests** | `load-test.spec.ts` | 7 | Stress, charge, concurrents |
| **Settings** | `settings*.spec.ts` | 21 | Configuration utilisateur |

---

## Exécution des Tests {#exécution}

### Commandes de Base

```bash
cd frontend

# Tous les tests
npx playwright test

# Tests spécifiques
npx playwright test tests/devices-crud.spec.ts
npx playwright test tests/reports-api.spec.ts
npx playwright test tests/performance.spec.ts

# Par pattern
npx playwright test --grep "devices"
npx playwright test --grep "api"
```

### Options Avancées

```bash
# Mode UI (visuel)
npx playwright test --ui

# Navigateur spécifique
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Avec rapport HTML
npx playwright test --reporter=html

# Ouvrir rapport
npx playwright show-report

# Mode debug
npx playwright test --debug

# Répéter les échoués
npx playwright test --retries=3

# Workers parallèles
npx playwright test --workers=4
```

### Exécution Séquentielle Recommandée

```bash
# 1. Tests rapides (smoke tests)
npx playwright test tests/devices.spec.ts tests/navigation-tabs.spec.ts

# 2. Tests CRUD
npx playwright test tests/devices-crud.spec.ts

# 3. Tests API
npx playwright test tests/reports-api.spec.ts tests/api.spec.ts

# 4. Tests complets
npx playwright test tests/e2e-workflows.spec.ts

# 5. Performance & Load
npx playwright test tests/performance.spec.ts tests/load-test.spec.ts

# 6. Accessibilité (dernier car plus lent)
npx playwright test tests/accessibility.spec.ts
```

---

## Création de Nouveaux Tests {#création}

### Structure de Base

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nom de la Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup avant chaque test
    test.setTimeout(60000);
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        name: 'Test User'
      }));
    });
  });

  test('should do something', async ({ page }) => {
    // 1. Navigation
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // 2. Action
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    
    // 3. Assertion
    await expect(page.locator('[data-testid="devices-view"]')).toBeVisible();
  });
});
```

### Bonnes Pratiques pour les data-testid

#### Règles de Nommage

```typescript
// ✅ Bonnes pratiques
[data-testid="devices-view"]           // Vue principale
[data-testid="devices-add-button"]     // Bouton d'action
[data-testid="device-modal"]           // Modal
[data-testid="device-modal-name"]      // Champ de formulaire
[data-testid="device-card-123"]        // Élément dynamique avec ID
[data-testid="nav-devices"]            // Navigation
[data-testid="settings-tab-profile"]   // Onglets

// ❌ À éviter
[data-testid="button"]                  // Trop générique
[data-testid="div1"]                    // Pas descriptif
[data-testid="click-here"]              // Action plutôt que contenu
```

#### Hiérarchie des data-testid

```
Page/View
├── nav-{view}                    (Navigation)
├── {view}-view                   (Container principal)
├── {view}-title                  (Titre)
├── {view}-add-button            (Bouton principal)
├── {view}-search                (Barre de recherche)
├── {view}-{feature}-filter      (Filtres)
├── {view}-list                  (Liste d'items)
│   └── {item}-card-{id}         (Carte individuelle)
│       └── {item}-edit-button   (Action sur item)
│       └── {item}-delete-button
└── {feature}-modal              (Modal)
    ├── {feature}-modal-close
    ├── {feature}-modal-{field}  (Champs)
    ├── {feature}-modal-save
    └── {feature}-modal-cancel
```

### Patterns de Tests Courants

#### Test de Navigation

```typescript
test('should navigate to Devices', async ({ page }) => {
  await page.locator('[data-testid="nav-devices"]').click();
  await page.waitForTimeout(500);
  await expect(page.locator('[data-testid="devices-view"]')).toBeVisible();
});
```

#### Test de Formulaire

```typescript
test('should fill and submit form', async ({ page }) => {
  // Ouvrir modal
  await page.locator('[data-testid="devices-add-button"]').click();
  
  // Remplir formulaire
  await page.locator('[data-testid="device-modal-name"]').fill('Test Device');
  await page.locator('[data-testid="device-modal-type"]').selectOption('Tool');
  
  // Soumettre
  await page.locator('[data-testid="device-modal-save"]').click();
  
  // Vérifier fermeture
  await expect(page.locator('[data-testid="device-modal"]')).not.toBeVisible();
});
```

#### Test API

```typescript
test('API should respond', async ({ request }) => {
  const response = await request.get('http://localhost:8002/api/devices', {
    headers: { 'Authorization': 'Bearer mock-token' }
  });
  
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
});
```

#### Test avec Attente Conditionnelle

```typescript
test('should wait for loading', async ({ page }) => {
  await page.locator('[data-testid="nav-devices"]').click();
  
  // Attendre que le loading disparaisse ou que les données apparaissent
  await page.waitForSelector(
    '[data-testid="devices-list"], [data-testid="devices-empty"]',
    { timeout: 10000 }
  );
});
```

---

## Dépannage {#dépannage}

### Problèmes Courants

#### 1. Tests qui Timeout

```typescript
// Augmenter le timeout
test.setTimeout(120000); // 2 minutes

// Ou dans la config
// playwright.config.ts
expect: {
  timeout: 10000,
}
```

#### 2. Éléments Non Trouvés

```typescript
// Attendre que l'élément soit visible
await page.waitForSelector('[data-testid="device-modal"]', { timeout: 5000 });

// Vérifier si visible avant action
const isVisible = await page.locator('[data-testid="modal"]').isVisible();
if (isVisible) {
  // action
}
```

#### 3. Navigation qui Échoue

```typescript
// Toujours attendre networkidle
await page.goto('/', { waitUntil: 'networkidle' });

// Attendre que la page soit prête
await page.waitForTimeout(1000);
```

#### 4. Authentification

```typescript
// Mock auth avant navigation
await page.addInitScript(() => {
  localStorage.setItem('token', 'mock-token');
  localStorage.setItem('user', JSON.stringify({
    id: 1,
    email: 'test@example.com',
    role: 'ADMIN',
    name: 'Test User'
  }));
});

// Recharger pour appliquer
await page.reload({ waitUntil: 'networkidle' });
```

### Debug

```bash
# Mode debug avec step-by-step
npx playwright test --debug

# Ouvrir trace viewer
npx playwright show-trace trace.zip

# Console logs
DEBUG=pw:api npx playwright test
```

---

## Bonnes Pratiques {#bonnes-pratiques}

### 1. Structure des Tests

```typescript
test.describe('Feature', () => {
  // Groupes logiques
  test.describe('Navigation', () => { ... });
  test.describe('CRUD Operations', () => { ... });
  test.describe('Validation', () => { ... });
});
```

### 2. Nomenclature des Tests

```typescript
// Descriptif et clair
test('should add device with valid data', ...);
test('should show error when name is empty', ...);
test('should navigate to reports in under 2 seconds', ...);

// Éviter
test('test 1', ...);
test('it works', ...);
```

### 3. Assertions Explicites

```typescript
// ✅ Bon
await expect(page.locator('[data-testid="devices-view"]')).toBeVisible();
await expect(page.locator('[data-testid="device-count"]')).toContainText('5');

// ❌ Mauvais
expect(await page.locator('[data-testid="devices-view"]').isVisible()).toBe(true);
```

### 4. Gestion des États

```typescript
// Nettoyer après chaque test
test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});
```

### 5. Tests Indépendants

Chaque test doit pouvoir s'exécuter seul :

```typescript
// ❌ Mauvais - dépend du test précédent
test('step 1: create', ...);
test('step 2: edit', ...); // Échoue si step 1 échoue

// ✅ Bon - test complet
 test('should create and edit device', async () => {
  // Create
  ...
  // Edit
  ...
});
```

---

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev/docs/intro)
- [Assertions Playwright](https://playwright.dev/docs/test-assertions)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

## 🎯 Exemple Complet

```typescript
import { test, expect } from '@playwright/test';

test.describe('Device Management', () => {
  const mockUser = {
    id: 1,
    email: 'admin@example.com',
    role: 'ADMIN',
    name: 'Admin User'
  };

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
  });

  test('complete device workflow', async ({ page }) => {
    // 1. Navigation
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // 2. Aller à Devices
    await page.locator('[data-testid="nav-devices"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="devices-view"]')).toBeVisible();
    
    // 3. Ouvrir modal
    await page.locator('[data-testid="devices-add-button"]').click();
    await page.waitForSelector('[data-testid="device-modal"]', { timeout: 2000 });
    
    // 4. Remplir formulaire
    await page.locator('[data-testid="device-modal-name"]').fill('Test Excavator');
    await page.locator('[data-testid="device-modal-type"]').selectOption('Heavy Machinery');
    
    // 5. Sauvegarder
    await page.locator('[data-testid="device-modal-save"]').click();
    await page.waitForTimeout(1000);
    
    // 6. Vérifier fermeture
    await expect(page.locator('[data-testid="device-modal"]')).not.toBeVisible();
    
    console.log('✅ Device workflow completed successfully');
  });
});
```

---

**Document créé le 14 Avril 2026**  
**Version 1.0**
