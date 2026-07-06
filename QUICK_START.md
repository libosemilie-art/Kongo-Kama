# 🚀 Quick Reference - Kongo Kama Deployment

## ⚡ Commandes Essentielles

### Développement
```bash
npm run dev        # Lancer le serveur local (http://localhost:5173)
npm run build      # Construire pour production
npm run preview    # Prévisualiser la build
npm run lint       # Vérifier le code
npm run typecheck  # Vérifier les types TypeScript
```

### Déploiement
```bash
git add .
git commit -m "Mise à jour"
git push origin main    # → Netlify déploie automatiquement!
```

## 🔑 Variables d'Environnement

### Fichier `.env.local` (ne pas commiter)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Obtenir les Valeurs
1. Supabase Dashboard → Settings → API
2. Copier `Project URL` et `anon key`
3. Coller dans `.env.local` (local) et Netlify Dashboard (production)

## 📊 Checklist de Déploiement

- [ ] `.env.local` créé avec identifiants Supabase
- [ ] `npm run build` fonctionne sans erreur
- [ ] Code poussé sur GitHub
- [ ] Netlify connecté au dépôt GitHub
- [ ] Variables d'environnement ajoutées dans Netlify Dashboard
- [ ] Premier déploiement lancé
- [ ] Site accessible à votre URL Netlify

## 🔗 Liens Importants

| Lien | Description |
|------|-------------|
| [Netlify Dashboard](https://app.netlify.com) | Gestion des déploiements |
| [GitHub Repo](https://github.com/votre-username/kongo-kama) | Code source |
| [Supabase Console](https://app.supabase.com) | Base de données |
| [Votre Site](https://kongo-kama.netlify.app) | Site en production |

## 🆘 Problèmes Courants

### Build échoue
→ Consultez les logs: Netlify Dashboard → Deploy logs

### Variables d'environnement non détectées
→ Vérifiez que les clés correspondent exactement:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### "Module not found" ou erreurs TypeScript
```bash
npm install
npm run typecheck
npm run build
```

### Site blanc après déploiement
→ Ouvrez DevTools (F12) → Console → Vérifiez les erreurs
→ Assurez-vous que les variables Supabase sont correctes

## 📁 Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `netlify.toml` | Configuration Netlify |
| `.env.example` | Template variables |
| `index.html` | Meta tags & favicon |
| `public/logo.svg` | Logo (favicon + OG) |
| `src/lib/supabase.ts` | Configuration Supabase |

## 🎯 Prochaines Étapes

1. **Initialiser Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Créer GitHub Repo et Push**
   ```bash
   git remote add origin https://github.com/votre-username/kongo-kama.git
   git branch -M main
   git push -u origin main
   ```

3. **Netlify**
   - Allez sur netlify.com
   - New site → Import from Git → Sélectionner votre repo
   - Ajouter variables d'environnement
   - Déployer!

## 💡 Tips

- Push vers `main` = déploiement automatique
- Vérifiez toujours avec `npm run build` avant de pusher
- Logs disponibles dans Netlify Dashboard
- Vous pouvez créer des branches pour preview deployments

---

**Besoin d'aide?** Consultez `README.md` ou `NETLIFY_DEPLOYMENT.md`
