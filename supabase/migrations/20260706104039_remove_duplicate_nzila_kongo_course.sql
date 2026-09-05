-- Remove the duplicate "Nzila Kongo — Accès Restreint" course
-- It has 0 active classes and shows as a dead entry in the student catalog.
-- Deletion by slug (stable) instead of a hardcoded UUID.
DELETE FROM courses WHERE slug = 'nzila-kongo-restreint';
