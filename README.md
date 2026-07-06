# 🌍 Kongo Kama - Site Web

Plateforme d'apprentissage en ligne pour la **Kongologie** - Kikongo, Bukongo et spiritualité Kongo ancestrale.

## 🎯 Stack Technologique

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Base de Données**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Icons**: Lucide React
- **Linting**: ESLint

## 🚀 Démarrage Rapide

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/kongo-kama.git
cd kongo-kama

# Installer les dépendances
npm install

# Créer le fichier .env.local
cp .env.example .env.local

# Éditer .env.local avec vos identifiants Supabase
```

### Développement

```bash
# Lancer le serveur de développement
npm run dev

# Vérifier les types TypeScript
npm run typecheck

# Linter le code
npm run lint
```

### Build

```bash
# Construire pour production
npm run build

# Prévisualiser la build
npm run preview
```

## 🗄️ Configuration Supabase

### Variables d'Environnement Requises

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Pour Obtenir vos Identifiants

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet ou sélectionnez le vôtre
3. Allez dans **Settings** → **API**
4. Copiez:
   - `Project URL` → `VITE_SUPABASE_URL`
   - La clé `anon` (public) → `VITE_SUPABASE_ANON_KEY`

## 🌐 Déploiement sur Netlify

### Étape 1: Push sur GitHub

```bash
git add .
git commit -m "Prêt pour Netlify"
git push origin main
```

### Étape 2: Connecter Netlify

1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez **Add new site** → **Import an existing project**
3. Sélectionnez votre dépôt GitHub
4. Configuration de build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Étape 3: Ajouter les Variables d'Environnement

Dans Netlify Dashboard:
1. Allez à **Site settings** → **Build & deploy** → **Environment**
2. Cliquez **Add environment variables**
3. Ajoutez:
   - Clé: `VITE_SUPABASE_URL` → Valeur: votre URL Supabase
   - Clé: `VITE_SUPABASE_ANON_KEY` → Valeur: votre clé Supabase

### Étape 4: Déployer

```bash
git push origin main
```

Netlify construira et déploiera automatiquement! 🚀

## 📁 Structure du Projet

```
kongo-kama/
├── src/
│   ├── components/      # Composants React réutilisables
│   ├── pages/          # Pages principales
│   ├── contexts/       # React Contexts (Auth, Theme)
│   ├── lib/            # Configuration Supabase
│   ├── App.tsx         # Composant racine
│   └── main.tsx        # Point d'entrée
├── public/
│   └── logo.svg        # Logo (favicon & OG image)
├── supabase/
│   ├── migrations/     # Scripts SQL
│   └── functions/      # Fonctions serverless
├── netlify.toml        # Configuration Netlify
├── index.html          # HTML principal
└── package.json        # Dépendances
```

## 🔐 Sécurité

- ❌ **Ne jamais** commiter le fichier `.env.local`
- ✅ Utilisez `.env.example` pour les templates
- ✅ Gardez vos clés Supabase confidentielles
- ✅ Utilisez les variables d'environnement Netlify pour la production

## 🎨 Personnalisation

### Logo et Favicon

- Logo: `public/logo.svg` (utilisé comme favicon et OG image)
- Favicon: Se met à jour automatiquement depuis `logo.svg`

### Thème

- Mode sombre activé par défaut (`dark` class sur `<html>`)
- Modifier dans `index.html` ou en React Context

### Meta Tags

- SEO configuré dans `index.html`
- Open Graph tags pour réseaux sociaux
- Twitter Card support

## 📊 Analytics et Monitoring

Vous pouvez ajouter:
- Google Analytics
- Sentry (error tracking)
- LogRocket (session replay)

## 🆘 Troubleshooting

### "Module not found"
```bash
npm install
npm run typecheck
```

### "Supabase connection failed"
- Vérifiez les variables d'environnement
- Testez la connexion: Vérifiez que l'URL et la clé sont correctes

### "Build fails on Netlify"
- Consultez les **Deploy logs** dans Netlify Dashboard
- Assurez-vous que `npm run build` fonctionne localement

## 📚 Ressources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Tailwind CSS](https://tailwindcss.com)

## 📝 Licence

© 2026 Kongo Kama. Tous droits réservés.

---

**Besoin d'aide?** Consultez `NETLIFY_DEPLOYMENT.md` pour plus de détails sur le déploiement.
