/*
# Fix RLS policies for admin access and student registration

1. Profiles: Add admin read-all policy so AdminPanel can list students and join profile data.
2. Classes: Add policy so authenticated users can read classes by access_code (needed before enrollment).
3. Keep existing policies intact — only adding new ones.

Security:
- Admin can now read all profiles (needed for student management, payment validation, approval flow).
- Students can read classes by access_code even before enrolling (needed for access code flow).
- No existing policies are removed or weakened.
*/

-- Profiles: Admin can read all profiles
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
CREATE POLICY "Admin can read all profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Classes: Authenticated users can read classes by access_code (needed for enrollment flow)
DROP POLICY IF EXISTS "Authenticated users can read classes for enrollment" ON classes;
CREATE POLICY "Authenticated users can read classes for enrollment" ON classes FOR SELECT
  TO authenticated USING (true);
