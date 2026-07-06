-- Remove the duplicate "Nzila Kongo — Accès Restreint" course
-- It has 0 active classes and shows as a dead entry in the student catalog
DELETE FROM courses WHERE id = '602ad81b-512e-44a4-a8ed-cc9096afc2f5';
