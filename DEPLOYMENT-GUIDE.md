# 🚀 Guide de Déploiement - PDL-145T Management System

## 🎯 Objectif
Déployer l'application full-stack (React + Express + PostgreSQL) gratuitement sur Render.com pour permettre aux utilisateurs de tester en ligne.

---

## 📋 Prérequis

1. Compte [Render.com](https://render.com) (gratuit)
2. Compte [GitHub](https://github.com) (pour héberger le code)
3. Git installé localement

---

## 🛠️ Étape 1 : Préparer le Code pour le Déploiement

### 1.1 Backend - Modifier les URLs API

Vérifiez que le frontend utilise l'URL de l'API Render :

**Fichier :** `frontend/src/api/config.ts` (à créer si inexistant)

```typescript
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8002';
```

### 1.2 Backend - Script de démarrage

Vérifiez que `backend/package.json` contient :

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "tsx src/index.ts"
  }
}
```

### 1.3 Variables d'environnement

Créez `backend/.env.example` :

```env
PORT=10000
NODE_ENV=production
JWT_SECRET=votre_secret_jwt_aleatoire
DATABASE_URL=postgresql://...
```

---

## 🌐 Étape 2 : Publier sur GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit - PDL-145T Management System"

# Créer un repo sur GitHub puis pousser
git remote add origin https://github.com/VOTRE_USERNAME/pdl145t-management.git
git branch -M main
git push -u origin main
```

---

## ☁️ Étape 3 : Déployer sur Render.com

### 3.1 Créer une Web Service (Backend)

1. Connectez-vous à [dashboard.render.com](https://dashboard.render.com)
2. Cliquez **"New +"** → **"Web Service"**
3. Connectez votre repo GitHub
4. Remplissez les champs :

   | Champ | Valeur |
   |-------|--------|
   | Name | `pdl145t-backend` |
   | Environment | `Node` |
   | Build Command | `cd backend && npm install && npm run build && npx prisma migrate deploy && npx prisma db seed` |
   | Start Command | `cd backend && npm start` |
   | Plan | `Free` |

5. Cliquez **"Create Web Service"**

### 3.2 Ajouter la Base de Données PostgreSQL

1. **"New +"** → **"PostgreSQL"**
2. Name : `pdl145t-db`
3. Plan : `Free`
4. Cliquez **"Create Database"**

5. **Copier l'Internal Database URL** et l'ajouter comme Environment Variable dans le Web Service :
   - Key : `DATABASE_URL`
   - Value : (Internal Database URL)

### 3.3 Créer un Static Site (Frontend)

1. **"New +"** → **"Static Site"**
2. Connectez le même repo GitHub
3. Remplissez :

   | Champ | Valeur |
   |-------|--------|
   | Name | `pdl145t-frontend` |
   | Build Command | `cd frontend && npm install && npm run build` |
   | Publish Directory | `frontend/dist` |
   | Plan | `Free` |

4. Ajoutez l'Environment Variable :
   - Key : `VITE_API_URL`
   - Value : `https://pdl145t-backend.onrender.com`

5. Cliquez **"Create Static Site"**

---

## 🔧 Étape 4 : Configuration Post-Déploiement

### 4.1 CORS Backend

Assurez-vous que le backend accepte les requêtes du frontend :

Dans `backend/src/index.ts` :
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://pdl145t-frontend.onrender.com'
  ],
  credentials: true
}));
```

### 4.2 Créer un utilisateur de test

Une fois déployé, créez un utilisateur de test via l'API :

```bash
curl -X POST https://pdl145t-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@pdl145.com",
    "password": "test123",
    "role": "admin"
  }'
```

---

## ✅ Étape 5 : Vérification

### URLs attendues :
- **Frontend** : `https://pdl145t-frontend.onrender.com`
- **Backend API** : `https://pdl145t-backend.onrender.com`
- **Health Check** : `https://pdl145t-backend.onrender.com/api/health`

### Test rapide :
```bash
# Vérifier le backend
curl https://pdl145t-backend.onrender.com/api/health

# Vérifier les programmes
curl https://pdl145t-backend.onrender.com/api/programs
```

---

## ⚠️ Limitations du Plan Gratuit

| Limitation | Impact | Solution |
|------------|--------|----------|
| Spin down après 15min | Premier chargement lent (~30s) | Normal pour le test |
| DB gratuite expire en 90j | Perte des données | Upgrade ou backup régulier |
| 750h/mois de service | Sufficient pour 1 instance | Surveillance du dashboard |

---

## 🚀 Alternative : Railway.app

Si Render.com ne convient pas :

1. Connectez-vous à [railway.app](https://railway.app)
2. Cliquez **"New Project"** → **"Deploy from GitHub repo"**
3. Sélectionnez votre repo
4. Railway détectera automatiquement le `render.yaml` ou créera les services
5. Crédit gratuit : $5/mois (suffisant pour tester)

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans le dashboard Render
2. Assurez-vous que `DATABASE_URL` est bien configurée
3. Vérifiez que les migrations Prisma sont exécutées

---

## 🎉 Félicitations !

Votre application est maintenant accessible en ligne ! Partagez l'URL :
```
https://pdl145t-frontend.onrender.com
```

**Identifiants de test pour les invités :**
- Email : `test@pdl145.com`
- Password : `test123`
