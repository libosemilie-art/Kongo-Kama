# Kongo Kama - Guide de Déploiement sur Netlify

## 📋 Checklist de Déploiement

### 1. **Configuration Supabase**
- [ ] Créez un projet Supabase sur https://supabase.com
- [ ] Récupérez votre `VITE_SUPABASE_URL`
- [ ] Récupérez votre `VITE_SUPABASE_ANON_KEY`
- [ ] Copiez-les dans un fichier `.env.local` (ne jamais commiter)

### 2. **Préparation du Dépôt Git**
```bash
git init
git add .
git commit -m "Initial commit - Kongo Kama"
git branch -M main
git remote add origin https://github.com/votre-username/kongo-kama.git
git push -u origin main
```

### 3. **Configuration Netlify**
1. Allez sur https://netlify.com et connectez-vous
2. Cliquez sur "Add new site" > "Import an existing project"
3. Sélectionnez votre dépôt GitHub
4. Configuration de Build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Allez dans "Site settings" > "Build & deploy" > "Environment"
6. Ajoutez les variables d'environnement:
   ```
   VITE_SUPABASE_URL = votre_url
   VITE_SUPABASE_ANON_KEY = votre_clé
   ```

### 4. **Fichiers Importants**
- `netlify.toml` - Configuration Netlify ✅ Créé
- `.env.example` - Template pour variables d'environnement ✅ Créé
- `public/logo.svg` - Logo (favicon & OG image) ✅ Créé
- `index.html` - Mis à jour avec favicon ✅ Fait

### 5. **Vérification Avant Déploiement**

```bash
# Vérifier la build locale
npm run build

# Tester la preview
npm run preview

# Vérifier les types TypeScript
npm run typecheck

# Vérifier le linting
npm run lint
```

### 6. **Variables d'Environnement Supabase**

Pour obtenir vos identifiants Supabase:
1. Allez dans Settings > API
2. Copier `Project URL` → `VITE_SUPABASE_URL`
3. Copier `anon` public key → `VITE_SUPABASE_ANON_KEY`

### 7. **Redirection SPA**
Le `netlify.toml` configure automatiquement les redirections pour React Router:
```
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 8. **Performance & SEO**
- ✅ Logo SVG optimisé
- ✅ Favicon configuré
- ✅ Open Graph tags configurés
- ✅ Meta descriptions en place
- ✅ Mobile responsive (viewport meta tag)

## 🚀 Déploiement en Une Ligne

Une fois Netlify configuré, chaque push vers `main` déploiera automatiquement!

```bash
git push origin main
```

## 📞 Troubleshooting

### "Environment variables not found"
→ Vérifiez que les variables sont ajoutées dans Netlify Dashboard sous "Environment"

### "Build fails"
→ Vérifiez dans Netlify "Deploy logs" pour les erreurs

### "Blank page après déploiement"
→ Vérifiez que les variables Supabase sont correctes et que la base de données est accessible

---

**Prochaines étapes:**
1. Push le code sur GitHub
2. Connectez Netlify à votre dépôt
3. Ajoutez les variables d'environnement
4. Lancez le déploiement! 🚀
