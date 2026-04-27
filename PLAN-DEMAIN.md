# 📋 PLAN DE TRAVAIL - DEMAIN

## 🎯 Objectif Principal
**Résoudre le problème d'affichage des données Programs dans le frontend**

---

## 📊 Contexte Actuel (20 Avril 2026)

### ✅ Ce Qui Fonctionne
- [x] Backend API `/api/programs` opérationnel
- [x] Base de données PDL 145T Maï-Ndombe créée (34 sites, 4 territoires)
- [x] Modèle Program avec hiérarchie projet/tâche implémenté
- [x] Authentification JWT configurée
- [x] Frontend redirigé vers proxy Vite (`/api` au lieu de `localhost:8002`)

### ❌ Problème À Résoudre
- **Frontend n'affiche pas les données Programs**
- Erreur potentielle : CORS, Auth, ou parsing des données

---

## 🔧 Étapes de Diagnostic (Priorité Haute)

### Étape 1 : Vérification Basique (10 min)
```bash
# 1. Démarrer les serveurs
cd backend && npm run dev
cd frontend && npm run dev

# 2. Vérifier base de données
curl http://localhost:8002/api/programs -H "Authorization: Bearer <token>"
```

**Checklist :**
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Base de données contient les programmes

---

### Étape 2 : Test Navigateur (15 min)

**A. Console Test (F12)**
```javascript
// Test 1: Vérifier token
console.log(localStorage.getItem('token'));

// Test 2: Requête API
fetch('/api/programs', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => console.log('Data:', data))
.catch(e => console.error('Error:', e));
```

**B. Network Tab (F12 → Network)**
- [ ] Vérifier requête `/api/programs`
- [ ] Vérifier code HTTP (200, 401, 500?)
- [ ] Vérifier réponse JSON

---

### Étape 3 : Identification du Problème (20 min)

| Scénario | Symptôme | Solution |
|----------|----------|----------|
| **A** | Status 401 Unauthorized | Token invalide/expiré → Vérifier authMiddleware |
| **B** | Status 500 + erreur serveur | Erreur Prisma/controller → Vérifier logs backend |
| **C** | Status 200 mais vide `[]` | Base vide → Relancer seed |
| **D** | Status 200 + data mais erreur parsing | Format JSON invalide → Vérifier controller |
| **E** | Request ne part pas (CORS) | Erreur proxy Vite → Vérifier vite.config.ts |

---

## 🔧 Solutions Potentielles

### Option 1 : Si Erreur Auth (401)
```typescript
// backend/src/routes/programRoutes.ts
// TEMPORAIRE: Désactiver auth pour test
// router.use(requireAuth);
```

### Option 2 : Si Base Vide
```bash
cd backend
npx prisma migrate reset --force
npx prisma generate
npx ts-node scripts/seed-pdl145-data.ts
```

### Option 3 : Si Erreur Proxy
```typescript
// frontend/vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8002',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api/, '/api'),
  }
}
```

### Option 4 : Si Erreur Frontend
```typescript
// ProgramsView.tsx - Ajouter try/catch détaillé
const fetchPrograms = async () => {
  try {
    const response = await fetch('/api/programs', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Programs loaded:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to load programs:', error);
    throw error;
  }
};
```

---

## 📝 Fichiers Clés à Vérifier

| Fichier | Rôle | Ligne Critique |
|---------|------|----------------|
| `backend/src/routes/programRoutes.ts` | Routes API | L15: `router.use(requireAuth)` |
| `backend/src/controllers/programController.ts` | Logique métier | `getPrograms()` function |
| `frontend/src/components/Programs/ProgramsView.tsx` | Affichage | `fetchPrograms()` function |
| `frontend/vite.config.ts` | Proxy Vite | `server.proxy['/api']` |
| `backend/prisma/schema.prisma` | Structure DB | `model Program`, `model Project` |

---

## 🎓 Documentation Référence

- **Backend API**: `GET /api/programs` → Liste programmes
- **Frontend Component**: `ProgramsView.tsx` → Affiche programmes
- **Seed Data**: `scripts/seed-pdl145-data.ts` → 34 sites Maï-Ndombe
- **Proxy Config**: `vite.config.ts` → Redirection `/api` → `:8002`

---

## 🚀 Commandes de Démarrage (Demain)

```bash
# Terminal 1 - Backend
cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/backend
npm run dev

# Terminal 2 - Frontend
cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/frontend
npm run dev

# Terminal 3 - Test API
curl http://localhost:8002/api/health
curl http://localhost:5173/api/programs -H "Authorization: Bearer <token>"
```

---

## 📊 Données Attendues Après Correction

```
Program: PDL 145 T - Maï-Ndombe
├── Territoire de Mushie (8 projets)
│   ├── École Primaire Mushie Centre
│   ├── École Secondaire Technique Mushie
│   └── ...
├── Territoire d'Inongo (12 projets)
├── Territoire d'Yumbi (6 projets)
└── Territoire de Kutu (8 projets)
```

---

## ✅ Définition de "Succès"

- [ ] Page Programs affiche le programme PDL 145T
- [ ] 34 projets visibles avec leurs territoires
- [ ] Hiérarchie des tâches accessible
- [ ] Pas d'erreur dans la console

---

**Créé le**: 20 Avril 2026
**Mise à jour**: À compléter demain après résolution
