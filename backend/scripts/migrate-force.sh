#!/bin/bash
# Script pour forcer les migrations Prisma sur Render

echo "========================================"
echo "🔧 Forçage des migrations Prisma"
echo "========================================"

cd /opt/render/project/src/backend

echo "1. Génération du client Prisma..."
npx prisma generate

echo ""
echo "2. Vérification des migrations..."
npx prisma migrate status

echo ""
echo "3. Déploiement des migrations..."
npx prisma migrate deploy

echo ""
echo "4. Si migrate deploy échoue, on tente un reset..."
npx prisma migrate resolve --applied $(ls -1 prisma/migrations | grep -v migration_lock.toml | head -1)

echo ""
echo "========================================"
echo "✅ Terminé !"
echo "========================================"
