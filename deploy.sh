#!/bin/bash

# Script de préparation au déploiement Netlify

echo "🚀 Préparation au déploiement Netlify..."
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi
echo "✅ npm $(npm --version)"

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Linter
echo ""
echo "🔍 Vérification du code..."
npm run lint

# TypeScript
echo ""
echo "📝 Vérification des types TypeScript..."
npm run typecheck

# Build
echo ""
echo "🔨 Construction du projet..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ La construction a échoué"
    exit 1
fi

echo ""
echo "✅ Préparation terminée!"
echo ""
echo "Prochaines étapes:"
echo "1. Assurez-vous d'avoir configuré les variables d'environnement (.env.local)"
echo "2. Testez localement: npm run preview"
echo "3. Poussez vers GitHub: git push origin main"
echo "4. Netlify déploiera automatiquement!"
echo ""
