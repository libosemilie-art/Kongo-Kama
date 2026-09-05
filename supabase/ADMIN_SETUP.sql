-- ============================================================
-- KONGO KAMA — CONFIGURATION ADMIN + VÉRIFICATION
-- ============================================================
-- Ce fichier ne fait PAS partie des migrations automatiques.
-- À exécuter UNE SEULE FOIS dans le SQL Editor de Supabase :
--   Dashboard Supabase → SQL Editor → New query → coller → Run
--
-- ÉTAPE 1 : Créer le compte admin dans Supabase
--   Option A (recommandée) :
--     Authentication → Users → "Add user"
--       - Email    : kongokama0@gmail.com
--       - Password : (choisissez un mot de passe fort)
--       - ✅ Cocher "Auto Confirm User"
--   Option B : inscrivez-vous normalement via le site
--     (le compte est créé en "student"), puis exécutez l'ÉTAPE 2.
--
-- ⚠️ AVANT TOUT : autoriser l'inscription des étudiants
--   Pour que l'inscription soit immédiate (sans email de confirmation),
--   allez dans : Authentication → Providers → Email
--     → décochez "Confirm email" (ou configurez un SMTP).
--   Sans cela, les étudiants reçoivent un email de confirmation
--   qu'ils ne reçoivent pas si aucun SMTP n'est configuré.
--
-- ÉTAPE 2 : Passer le compte en administrateur
-- ============================================================

-- Promouvoir le compte admin (remplacez l'email si besoin)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'kongokama0@gmail.com';

-- Sécurité : si le profil n'existe pas encore, le créer directement en admin
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Mbuta Sita Toma'), 'admin'
FROM auth.users
WHERE email = 'kongokama0@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ============================================================
-- VÉRIFICATION (optionnel — à exécuter pour contrôler)
-- ============================================================

-- 1. L'admin est-il bien en place ? (doit afficher role = 'admin')
SELECT id, email, full_name, role
FROM public.profiles
WHERE role = 'admin';

-- 2. Les cours de base sont-ils présents ?
SELECT id, title, division, is_free, requires_approval
FROM public.courses
ORDER BY order_index;

-- 3. Les tables principales existent-elles ?
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
