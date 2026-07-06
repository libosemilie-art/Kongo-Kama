@echo off

REM Script de préparation au déploiement Netlify (Windows)

echo.
echo 🚀 Préparation au déploiement Netlify...
echo.

REM Vérifier Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION%

REM Vérifier npm
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm n'est pas installé
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION%

REM Installer les dépendances
echo.
echo 📦 Installation des dépendances...
call npm install

REM Linter
echo.
echo 🔍 Vérification du code...
call npm run lint

REM TypeScript
echo.
echo 📝 Vérification des types TypeScript...
call npm run typecheck

REM Build
echo.
echo 🔨 Construction du projet...
call npm run build

if errorlevel 1 (
    echo ❌ La construction a échoué
    exit /b 1
)

echo.
echo ✅ Préparation terminée!
echo.
echo Prochaines étapes:
echo 1. Assurez-vous d'avoir configuré les variables d'environnement (.env.local)
echo 2. Testez localement: npm run preview
echo 3. Poussez vers GitHub: git push origin main
echo 4. Netlify déploiera automatiquement!
echo.
