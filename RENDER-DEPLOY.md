# 🚀 Déploiement Rapide sur Render.com

## 📋 Prérequis
- Compte GitHub (gratuit)
- Compte Render.com (gratuit)

---

## ÉTAPE 1 : Pousser sur GitHub (5 min)

```bash
# Depuis le dossier du projet
cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM

# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Ready for Render deployment"

# Créer un nouveau repo sur GitHub (sans README)
# Puis pousser :
git remote add origin https://github.com/VOTRE_USERNAME/pdl145t-app.git
git branch -M main
git push -u origin main
```

---

## ÉTAPE 2 : Créer la Base de Données (2 min)

1. Allez sur [dashboard.render.com](https://dashboard.render.com)
2. Cliquez **"New +"** → **"PostgreSQL"**
3. Configurez :
   - **Name** : `pdl145t-db`
   - **Database** : `pdl145t`
   - **User** : `pdl145t`
   - **Plan** : `Free`
4. Cliquez **"Create Database"**
5. **Copiez l'"Internal Database URL"** (sera utilisée à l'étape 3)

---

## ÉTAPE 3 : Déployer le Backend (5 min)

1. Sur Render, cliquez **"New +"** → **"Web Service"**
2. Connectez votre repo GitHub `pdl145t-app`
3. Configurez :

| Champ | Valeur |
|-------|--------|
| **Name** | `pdl145t-backend` |
| **Environment** | `Node` |
| **Build Command** | `cd backend && npm install && npm run build` |
| **Start Command** | `cd backend && npm start` |
| **Plan** | `Free` |

4. Cliquez **"Advanced"** et ajoutez les **Environment Variables** :

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (Collez l'URL de l'étape 2) |
| `JWT_SECRET` | (Générez une chaîne aléatoire de 32+ caractères) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://pdl145t-frontend.onrender.com` |

5. Cliquez **"Create Web Service"**

⏳ Attendez que le déploiement se termine (2-3 min)

---

## ÉTAPE 4 : Déployer le Frontend (3 min)

1. Sur Render, cliquez **"New +"** → **"Static Site"**
2. Connectez le même repo GitHub
3. Configurez :

| Champ | Valeur |
|-------|--------|
| **Name** | `pdl145t-frontend` |
| **Build Command** | `cd frontend && npm install && npm run build` |
| **Publish Directory** | `frontend/dist` |
| **Plan** | `Free` |

4. Cliquez **"Advanced"** et ajoutez :

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://pdl145t-backend.onrender.com` |

5. Cliquez **"Create Static Site"**

---

## ÉTAPE 5 : Créer un Utilisateur Test (2 min)

Une fois le backend déployé, créez un utilisateur de test :

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

## ✅ Vérification

Accédez à votre application :
- **Frontend** : `https://pdl145t-frontend.onrender.com`
- **Backend API** : `https://pdl145t-backend.onrender.com/api/health`

**Identifiants de test :**
- Email : `test@pdl145.com`
- Password : `test123`

---

## ⚠️ Limitations Gratuites

| Limitation | Impact |
|------------|--------|
| Spin down après 15 min | Premier chargement lent (~30s) |
| DB expire en 90 jours | Perte des données (faites des backups) |
| 750h/mois | Suffisant pour 1 service continu |

---

## 🆘 Problèmes Courants

### "Build failed"
- Vérifiez que `backend/package.json` a bien les scripts `build` et `start`
- Vérifiez les logs dans le dashboard Render

### "Cannot connect to database"
- Vérifiez que `DATABASE_URL` est correctement copiée
- Assurez-vous que la DB et le backend sont dans la même région

### "CORS error"
- Vérifiez que `FRONTEND_URL` correspond bien à l'URL du frontend
- Redéployez le backend après correction

---

## 🎉 Félicitations !

Votre application est en ligne ! Partagez l'URL :
```
https://pdl145t-frontend.onrender.com
```
