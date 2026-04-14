# 🎥 Tutoriel Complet - PDL-145T Management System

**Version:** 1.0  
**Date:** 14 Avril 2026  
**Durée estimée:** 30 minutes

---

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Démarrage Rapide](#démarrage-rapide)
4. [Navigation dans l'App](#navigation)
5. [Gestion des Devices (CRUD)](#gestion-devices)
6. [Génération de Rapports](#génération-rapports)
7. [Configuration Settings](#configuration-settings)
8. [Exécution des Tests](#exécution-tests)
9. [Dépannage](#dépannage)

---

## Introduction {#introduction}

Bienvenue dans ce tutoriel complet du **PDL-145T Management System**. Ce guide vous accompagne étape par étape pour :

- ✅ Démarrer l'application
- ✅ Gérer les équipements (Devices)
- ✅ Générer des rapports
- ✅ Configurer vos préférences
- ✅ Exécuter les tests automatisés

**Ce que vous allez apprendre :**
- Interface utilisateur moderne avec React
- Navigation intuitive entre les sections
- Opérations CRUD complètes (Create, Read, Update, Delete)
- Intégration API backend
- Tests automatisés avec Playwright

---

## Prérequis {#prérequis}

### 🖥️ Configuration Requise

```
- OS: Linux, macOS, ou Windows (WSL)
- Node.js: v18+ (v20 recommandé)
- npm: v9+
- RAM: 4GB minimum (8GB recommandé)
- Espace disque: 2GB libre
```

### 📦 Préparation de l'Environnement

#### Étape 1: Vérifier Node.js

```bash
# Terminal
node --version
# Output attendu: v18.x.x ou supérieur

npm --version
# Output attendu: 9.x.x ou supérieur
```

💡 **Si Node.js n'est pas installé :**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# macOS
brew install node

# Windows
# Télécharger depuis https://nodejs.org/
```

#### Étape 2: Cloner le Projet (si pas déjà fait)

```bash
cd /home/ascatsarl/Documents
# Le projet est déjà à: PDL-145T-MANAGEMENT-SYSTEM/
```

---

## Démarrage Rapide {#démarrage-rapide}

### 🚀 Étape 1: Démarrer le Backend

```bash
# Ouvrir un terminal
cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/backend

# 1. Installer les dépendances (si première fois)
npm install

# 2. Configurer la base de données
npx prisma migrate dev
npx prisma db seed

# 3. Démarrer le serveur
npm run dev
```

**✅ Vérification:**
```bash
# Dans un autre terminal
curl http://localhost:8002/api/health
# Output: {"status":"ok"}
```

**🖼️ Visuel:**
```
Terminal Backend:
🟢 Server running on http://localhost:8002
🟢 API documentation: http://localhost:8002/api-docs
🟢 Database: Connected
```

---

### 🚀 Étape 2: Démarrer le Frontend

```bash
# Ouvrir un NOUVEAU terminal
cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/frontend

# 1. Installer les dépendances (si première fois)
npm install

# 2. Installer Playwright (pour les tests)
npx playwright install chromium

# 3. Démarrer l'application
npm run dev
```

**✅ Vérification:**
```bash
# Ouvrir navigateur
http://localhost:5173/

# Vous devriez voir l'écran de login
```

**🖼️ Visuel - Écran de Login:**
```
┌─────────────────────────────────────┐
│         PDL-145T Management         │
│              System                 │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  📧 Email                    │  │
│  │  [admin@test.com      ]     │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  🔒 Password               │  │
│  │  [********            ]     │  │
│  └─────────────────────────────┘  │
│                                     │
│     ┌─────────────────────┐        │
│     │    🔓 Sign In       │        │
│     └─────────────────────┘        │
│                                     │
└─────────────────────────────────────┘
```

---

## Navigation dans l'App {#navigation}

### 🧭 Barre de Navigation

Une fois connecté, vous verrez la barre de navigation en haut :

**🖼️ Visuel:**
```
┌────────────────────────────────────────────────────────────────┐
│ 🏗️ PDL-145T Management    Dashboard  Devices  Reports  Settings │
│                          [🔴]      [🟡]     [🟢]     [🔵]     │
└────────────────────────────────────────────────────────────────┘
```

**Sections disponibles :**

| Onglet | Icône | Description |
|--------|-------|-------------|
| **Dashboard** | 🏠 | Vue d'ensemble du projet |
| **Devices** | 🔧 | Gestion des équipements |
| **Reports** | 📊 | Génération de rapports |
| **Settings** | ⚙️ | Configuration utilisateur |

---

## Gestion des Devices (CRUD) {#gestion-devices}

### 📖 Étape 1: Accéder à la Section Devices

**Action:** Cliquer sur l'onglet **Devices** dans la navigation

**🖼️ Visuel:**
```
Avant:
Dashboard  [Devices]  Reports  Settings
   ⚪        🔵        ⚪       ⚪

Après:
Dashboard  [Devices]  Reports  Settings
   ⚪        🔴        ⚪       ⚪
          (actif)
```

**Écran affiché:**
```
┌────────────────────────────────────────────────────────────┐
│ Devices & Equipment                               [+ Add]  │
├────────────────────────────────────────────────────────────┤
│ 🔍 Search...    [Filter ▼]                               │
├────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 🚜 Excavator CAT320                                  │  │
│ │ Type: Heavy Machinery    Status: 🟢 Active           │  │
│ │ Location: Site A - Zone 1                            │  │
│ │                                                      │  │
│ │ [View Details] [Schedule Maintenance]                │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 🏗️ Crane Tower TC-200                                │  │
│ │ Type: Heavy Machinery    Status: 🟡 Maintenance    │  │
│ │ Location: Site B - Main Tower                        │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

### ➕ Étape 2: Ajouter un Nouveau Device (CREATE)

**Action 1:** Cliquer sur le bouton **"+ Add"** (en haut à droite)

**🖼️ Visuel:**
```
┌────────────────────────────────────────────────────────────┐
│                                                    [🔵+ Add]│
└────────────────────────────────────────────────────────────┘
```

**Action 2:** Remplir le formulaire

**🖼️ Modal "Add New Device":**
```
┌────────────────────────────────────────────────────────────┐
│ ✕                    Add New Device                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Device Name *          Type *                               │
│ ┌──────────────────┐  ┌──────────────────────────┐       │
│ │ Concrete Mixer   │  │ [Heavy Machinery ▼]     │       │
│ └──────────────────┘  └──────────────────────────┘       │
│                                                            │
│ Status            Quantity                                  │
│ ┌────────────────┐  ┌──────────┐                           │
│ │ [Active ▼]     │  │    2     │                           │
│ └────────────────┘  └──────────┘                           │
│                                                            │
│ Location              Serial Number                         │
│ ┌──────────────────┐  ┌──────────────────┐                 │
│ │ Site C - Batch   │  │ CEM-2024-001     │                 │
│ └──────────────────┘  └──────────────────┘                 │
│                                                            │
│ Cost ($)              Purchase Date                        │
│ ┌──────────────────┐  ┌──────────────────┐                 │
│ │     75000        │  │ [2024-03-15]     │                 │
│ └──────────────────┘  └──────────────────┘                 │
│                                                            │
│ Description                                               │
│ ┌──────────────────────────────────────────────────┐       │
│ │ New concrete mixer for batch plant operations    │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│          [Cancel]  [💾 Add Device]                        │
└────────────────────────────────────────────────────────────┘
```

**Action 3:** Cliquer sur **"Add Device"**

**✅ Résultat attendu:**
- Le modal se ferme
- Le nouveau device apparaît dans la liste
- Message de succès (toast notification)

---

### ✏️ Étape 3: Modifier un Device (UPDATE)

**Action 1:** Trouver le device dans la liste et cliquer sur **"Edit"**

**🖼️ Visuel:**
```
┌────────────────────────────────────────────────────────────┐
│ 🚜 Excavator CAT320                                        │
│ ...                                                        │
│ [Edit ✏️] [Delete 🗑️]                                      │
└────────────────────────────────────────────────────────────┘
```

**Action 2:** Modifier les champs souhaités

**🖼️ Modal "Edit Device":**
```
┌────────────────────────────────────────────────────────────┐
│ ✕                     Edit Device                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Device Name *                                             │
│ ┌──────────────────────────────────────────────────┐       │
│ │ 🚜 Excavator CAT320 (Updated)                    │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│ Status                                                    │
│ ┌──────────────────────────────────────────────────┐       │
│ │ [Maintenance ▼] ← Changé de "Active"             │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│          [Cancel]  [💾 Update Device]                      │
└────────────────────────────────────────────────────────────┘
```

**Action 3:** Cliquer sur **"Update Device"**

**✅ Résultat attendu:**
- Le modal se ferme
- Le device est mis à jour dans la liste
- Le statut change de 🟢 à 🟡

---

### 🗑️ Étape 4: Supprimer un Device (DELETE)

**Action 1:** Cliquer sur **"Delete"** sur le device

**🖼️ Modal de Confirmation:**
```
┌────────────────────────────────────────────────────────────┐
│                     ⚠️ Delete Device                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│    ⚠️                                                     │
│                                                            │
│ Are you sure you want to delete Concrete Mixer?          │
│                                                            │
│ This action cannot be undone.                             │
│                                                            │
│ ┌──────────────────────────────────────────────────┐       │
│ │ Serial Number: CEM-2024-001                      │       │
│ │ Type: Heavy Machinery                            │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│          [Cancel]  [🗑️ Delete Device]                    │
└────────────────────────────────────────────────────────────┘
```

**Action 2:** Cliquer sur **"Delete Device"** pour confirmer

**✅ Résultat attendu:**
- Le modal se ferme
- Le device disparaît de la liste
- Message de confirmation

---

## Génération de Rapports {#génération-rapports}

### 📊 Étape 1: Accéder aux Rapports

**Action:** Cliquer sur l'onglet **Reports**

**🖼️ Visuel:**
```
┌────────────────────────────────────────────────────────────┐
│ Reports & Analytics                              [Generate]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Type: [Progress ▼]  Period: [Last 7 days ▼]  [📥 Export]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📄 Progress Report - March 2024                      │  │
│ │ Generated: 2 hours ago    Status: ✅ Completed       │  │
│ │ Type: Progress                                       │  │
│ │ [📥 Download PDF]                                  │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📄 Equipment Inventory Report                      │  │
│ │ Generated: 1 day ago      Status: ✅ Completed       │  │
│ │ Type: Inventory                                      │  │
│ │ [📥 Download PDF]                                  │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

### 🆕 Étape 2: Générer un Nouveau Rapport

**Action:** Cliquer sur **"Generate"**

**🖼️ Modal "Generate Report":**
```
┌────────────────────────────────────────────────────────────┐
│                   Generate New Report                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Report Name                                               │
│ ┌──────────────────────────────────────────────────┐       │
│ │ Q1 2024 Progress Report                          │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│ Report Type                                               │
│ ┌──────────────────────────────────────────────────┐       │
│ │ [Progress ▼]                                     │       │
│ │   - Progress Report                              │       │
│ │   - Equipment Inventory                          │       │
│ │   - Financial Summary                            │       │
│ │   - Maintenance Log                              │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│ Project (Optional)                                        │
│ ┌──────────────────────────────────────────────────┐       │
│ │ [All Projects ▼]                                 │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│ Date Range                                                │
│ ┌──────────────────┐    ┌──────────────────┐               │
│ │ [2024-01-01]     │ to │ [2024-03-31]     │               │
│ └──────────────────┘    └──────────────────┘               │
│                                                            │
│          [Cancel]  [⚡ Generate Report]                     │
└────────────────────────────────────────────────────────────┘
```

**Action:** Remplir et cliquer sur **"Generate Report"**

**✅ Résultat attendu:**
- Le rapport apparaît dans la liste avec statut "⏳ Generating"
- Après quelques secondes, statut devient "✅ Completed"
- Bouton "Download PDF" devient actif

---

## Configuration Settings {#configuration-settings}

### ⚙️ Étape 1: Accéder aux Settings

**Action:** Cliquer sur l'onglet **Settings**

**🖼️ Visuel:**
```
┌────────────────────────────────────────────────────────────┐
│ Settings                                                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ [Profile] [Notifications] [Security] [Appearance]       │
│   🔴         ⚪             ⚪          ⚪                 │
└────────────────────────────────────────────────────────────┘
```

---

### 👤 Étape 2: Configurer le Profil

**🖼️ Onglet "Profile":**
```
┌────────────────────────────────────────────────────────────┐
│ Profile Settings                                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Avatar                    ┌─────────────┐                  │
│ ┌─────────────┐          │   📷        │                  │
│ │    👤       │          │   Change    │                  │
│ │  (photo)    │          │   Avatar    │                  │
│ └─────────────┘          └─────────────┘                  │
│                                                            │
│ Full Name                                                 │
│ ┌──────────────────────────────────────────────────┐       │
│ │ John Doe                                           │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│ Email                                                     │
│ ┌──────────────────────────────────────────────────┐       │
│ │ john.doe@example.com                               │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│ Phone                                                     │
│ ┌──────────────────────────────────────────────────┐       │
│ │ +1 (555) 123-4567                                  │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│ Role: Administrator                                       │
│                                                            │
│          [💾 Save Changes]                               │
└────────────────────────────────────────────────────────────┘
```

---

### 🔔 Étape 3: Configurer les Notifications

**🖼️ Onglet "Notifications":**
```
┌────────────────────────────────────────────────────────────┐
│ Notification Settings                                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Email Notifications                                        │
│                                                            │
│ ☑️ Task updates and assignments                           │
│ ☑️ Budget approval requests                               │
│ ☐ Daily summary reports                                   │
│ ☑️ System maintenance alerts                              │
│                                                            │
│ Push Notifications                                         │
│                                                            │
│ ☑️ Enable push notifications                              │
│ ☑️ Critical alerts only                                   │
│ ☐ All notifications                                       │
│                                                            │
│          [💾 Save Preferences]                             │
└────────────────────────────────────────────────────────────┘
```

---

### 🎨 Étape 4: Changer l'Apparence

**🖼️ Onglet "Appearance":**
```
┌────────────────────────────────────────────────────────────┐
│ Appearance Settings                                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Theme                                                      │
│                                                            │
│ ○ Light    🔘 Dark    ○ System Default                    │
│                                                            │
│ Language                                                   │
│ ┌──────────────────────────────────────────────────┐       │
│ │ [English ▼]                                        │       │
│ │   English                                          │       │
│ │   Français                                         │       │
│ │   Español                                          │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│ Date Format                                               │
│ ┌──────────────────────────────────────────────────┐       │
│ │ [MM/DD/YYYY ▼]                                     │       │
│ │   MM/DD/YYYY                                       │       │
│ │   DD/MM/YYYY                                       │       │
│ │   YYYY-MM-DD                                       │       │
│ └──────────────────────────────────────────────────┘       │
│                                                            │
│          [💾 Apply Changes]                                │
└────────────────────────────────────────────────────────────┘
```

---

## Exécution des Tests {#exécution-tests}

### 🧪 Méthode 1: Script Automatique (Recommandé)

```bash
# Aller dans le projet
cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM

# Tests rapides (30 secondes)
./run-tests.sh --smoke

# Tests de régression (2 minutes)
./run-tests.sh --regression

# Tous les tests (10 minutes)
./run-tests.sh --full
```

**🖼️ Sortie attendue:**
```
🚀 PDL-145T Management System - Test Runner

🔍 Checking if servers are running...
⚠️  Backend not running
⚠️  Frontend not running

🟢 Starting backend...
📦 Installing backend dependencies...
🌱 Seeding database...
⏳ Waiting for backend (max 30s)...
..............................................................
✅ Backend ready

🟡 Starting frontend...
📦 Installing frontend dependencies...
⏳ Waiting for frontend (max 30s)...
..............................................................
✅ Frontend ready

🧪 Running tests...

Running 35 tests using 4 workers
[chromium] › devices.spec.ts:7:5 › Devices › should display devices page
  ✓  1  [chromium] › devices.spec.ts:7:5  (2s)
[chromium] › devices.spec.ts:18:5 › Devices › should filter devices by type
  ✓  2  [chromium] › devices.spec.ts:18:5  (3s)
...

35 passed (45s)

✅ Tests completed!
🧹 Cleaning up...
```

---

### 🧪 Méthode 2: Commandes Manuelles

#### Étape 1: Démarrer les Serveurs

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Étape 2: Lancer les Tests

**Terminal 3:**
```bash
cd frontend

# Tests spécifiques
npx playwright test tests/devices-crud.spec.ts

# Mode UI (visuel)
npx playwright test --ui

# Rapport HTML
npx playwright test --reporter=html
npx playwright show-report
```

---

### 📊 Comprendre les Résultats

**✅ Test Réussi:**
```
✓  [chromium] › devices.spec.ts:7:5  (2s)
```

**❌ Test Échoué:**
```
✗  [chromium] › devices-crud.spec.ts:37:9
Error: expect(locator).toBeVisible()
```

**⚠️ Test Sauté:**
```
⊘  [chromium] › performance.spec.ts:49:9
Skipped: SKIP_LIGHTHOUSE=true
```

---

## Dépannage {#dépannage}

### ❌ Problème: Backend ne démarre pas

**Symptômes:**
```
Error: DATABASE_URL not set
```

**Solution:**
```bash
cd backend
cp .env.example .env
# Éditer .env avec vos informations
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/pdl145t" > .env
npx prisma migrate dev
```

---

### ❌ Problème: Frontend ne démarre pas

**Symptômes:**
```
Error: Cannot find module '@vitejs/plugin-react'
```

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### ❌ Problème: Tests échouent avec timeout

**Symptômes:**
```
Test timeout of 60000ms exceeded
```

**Solution:**
```bash
# Vérifier que les serveurs tournent
curl http://localhost:5173/  # Frontend
curl http://localhost:8002/api/health  # Backend

# Augmenter le timeout dans le test
test.setTimeout(120000);  # 2 minutes
```

---

### ❌ Problème: Playwright non installé

**Symptômes:**
```
Error: Executable doesn't exist at /ms-playwright/chromium
```

**Solution:**
```bash
npx playwright install chromium
```

---

## 🎯 Cheat Sheet - Commandes Essentielles

### Démarrage
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Tests (avec script)
./run-tests.sh --smoke
```

### Tests
```bash
# Rapide
npx playwright test tests/navigation-tabs.spec.ts

# Complet
npx playwright test

# UI
npx playwright test --ui

# Debug
npx playwright test --debug
```

### Base de données
```bash
# Reset
npx prisma migrate reset

# Seed
npx prisma db seed

# Studio
npx prisma studio
```

---

## 📞 Support

### Ressources
- 📖 [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Guide détaillé
- 📊 [TEST-REPORT.md](./TEST-REPORT.md) - Rapport des tests
- 🔧 [README-TESTS.md](./README-TESTS.md) - Référence rapide

### Debug
```bash
# Vérifier l'état
curl http://localhost:8002/api/health
curl http://localhost:5173/

# Logs
cd backend && tail -f logs/app.log
cd frontend && npm run dev -- --debug

# Mode debug Playwright
npx playwright test --debug
```

---

**🎉 Félicitations ! Vous maîtrisez maintenant le PDL-145T Management System !**

---

**Tutoriel créé le 14 Avril 2026**  
**Version 1.0**
