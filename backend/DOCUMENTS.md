# Gestion documentaire PDL-145T (ontologie ascat)

Les documents du programme sont modélisés par le modèle Prisma `Document` et classés
par l'ontologie `ascat_documents_ontology.ttl` (`http://ontology.ascat-sarl.cd/core#`).

| Catégorie (dossier) | Classe ontologique |
|---|---|
| `JURIDIQUE/` | `ascat:ContratPDL145T` |
| `FINANCE/` | `ascat:DocumentFinancier` |
| `SUIVI/` | `ascat:DocumentSuivi` |
| `TECHNIQUE/` | `ascat:DocumentTechnique` |
| `ADMIN/` | `ascat:DocumentAdministratif` |

## 1. Mise en place

```bash
cd backend
npm install
cp .env.example .env        # renseigner DATABASE_URL, JWT_SECRET, DOCUMENTS_ROOT
```

`DOCUMENTS_ROOT` doit pointer vers le workspace contenant les dossiers classés
(`GME_ASCAT_SPPE`), c.-à-d. la racine où se trouvent `ADMIN/ FINANCE/ JURIDIQUE/ SUIVI/ TECHNIQUE/`.

## 2. Base de données et données

```bash
cd backend
npx prisma migrate deploy            # applique 20260917010000_add_document_model
npx prisma generate
cp /chemin/vers/GME_ASCAT_SPPE/digitalisation/seed-pdl145t.js scripts/
cp /chemin/vers/GME_ASCAT_SPPE/digitalisation/seed-documents-pdl145t.js scripts/
node scripts/seed-pdl145t.js           # territoires / projets / sites (prérequis)
node scripts/seed-documents-pdl145t.js  # 34 documents classés (ontologie)
```

> Les seeds sources sont dans `GME_ASCAT_SPPE/digitalisation/` et se copient dans `backend/scripts/`
> (= convention du seed J1). Le `.env` est alors résolu vers `backend/.env`.
> Ordre impératif : sites AVANT documents (les FK Projet/Territoire/Site doivent exister).

## 3. API `/api/documents`

Toutes les routes exigent un JWT (`Authorization: Bearer <token>`).

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/documents` | Liste paginée + filtres |
| `GET` | `/api/documents/stats` | Total et répartition par catégorie / phase / territoire |
| `GET` | `/api/documents/category/:category` | Documents d'une catégorie (`JURIDIQUE`…`ADMIN`) |
| `GET` | `/api/documents/:id` | Détail + relations Projet / Territoire / Site |
| `GET` | `/api/documents/:id/download` | Téléchargement du fichier physique |

Filtres de la liste : `page`, `limit`, `category`, `lot`, `territoire` (nom, insensible à la casse),
`siteId`, `phase`, `q` (recherche sur titre / nom de fichier / notes), `sortBy`, `sortOrder`.

```bash
TOKEN=$(curl -s -X POST http://localhost:3010/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"secret"}' | jq -r .token)

curl -s "http://localhost:3010/api/documents?category=FINANCE&territoire=Mushie" -H "Authorization: Bearer $TOKEN"
curl -s "http://localhost:3010/api/documents/stats" -H "Authorization: Bearer $TOKEN"
curl -sO -J "http://localhost:3010/api/documents/1/download" -H "Authorization: Bearer $TOKEN"
```

## 4. Interface frontend

Le composant `frontend/src/components/Documents/DocumentList.tsx` affiche les documents
(depuis `/api/documents`) avec filtres catégorie / lot / territoire / phase, recherche
debouncée, tableau (classe ontologique, lot, territoire, site, phase, date) et bouton de
téléchargement. Il est monté dans les tableaux de bord **Admin**, **Supervisor** et **Finance**.

## 5. Notes

- Le téléchargement résout `FilePath` sous `DOCUMENTS_ROOT` avec protection anti path-traversal.
- Les 2 documents historiques `DocPDF/` (absents du disque) répondent `404` avec un message explicite.
- L'extracteur `digitalisation/extract_documents_pdl145t.py` régénère `documents_pdl145t.json`
  et `seed-documents-pdl145t.js` ; ne pas éditer ces deux fichiers à la main.
