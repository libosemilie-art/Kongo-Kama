-- Fix infinite recursion in profiles RLS policies
-- The "Admin can read all profiles" policy queries profiles inside its own RLS check,
-- causing infinite recursion. Solution: use a SECURITY DEFINER function that checks
-- the user's role WITHOUT triggering RLS on profiles.

-- Drop the recursive admin read policy
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;

-- Create a SECURITY DEFINER function that checks if current user is admin
-- This function runs as the table owner, bypassing RLS, so no recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Recreate the admin read policy using the non-recursive function
CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (public.is_current_user_admin());

-- Also update any other policies across tables that use the same recursive pattern
-- by replacing inline subqueries with the is_current_user_admin() function

-- class_enrollments
DROP POLICY IF EXISTS "Students can read own enrollments" ON class_enrollments;
CREATE POLICY "Students can read own enrollments" ON class_enrollments
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can delete enrollments" ON class_enrollments;
CREATE POLICY "Admin can delete enrollments" ON class_enrollments
  FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can update enrollments" ON class_enrollments;
CREATE POLICY "Admin can update enrollments" ON class_enrollments
  FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- classes
DROP POLICY IF EXISTS "Admin can delete classes" ON classes;
CREATE POLICY "Admin can delete classes" ON classes
  FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can insert classes" ON classes;
CREATE POLICY "Admin can insert classes" ON classes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can update classes" ON classes;
CREATE POLICY "Admin can update classes" ON classes
  FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- courses
DROP POLICY IF EXISTS "Admin can insert courses" ON courses;
CREATE POLICY "Admin can insert courses" ON courses
  FOR INSERT TO authenticated
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can update courses" ON courses;
CREATE POLICY "Admin can update courses" ON courses
  FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- payments
DROP POLICY IF EXISTS "Admin can delete payments" ON payments;
CREATE POLICY "Admin can delete payments" ON payments
  FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can update payments" ON payments;
CREATE POLICY "Admin can update payments" ON payments
  FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Students can read own payments" ON payments;
CREATE POLICY "Students can read own payments" ON payments
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.is_current_user_admin());

-- modules
DROP POLICY IF EXISTS "Admin can delete modules" ON modules;
CREATE POLICY "Admin can delete modules" ON modules
  FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can insert modules" ON modules;
CREATE POLICY "Admin can insert modules" ON modules
  FOR INSERT TO authenticated
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can update modules" ON modules;
CREATE POLICY "Admin can update modules" ON modules
  FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- module_items
DROP POLICY IF EXISTS "Admin can delete module items" ON module_items;
CREATE POLICY "Admin can delete module items" ON module_items
  FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can insert module items" ON module_items;
CREATE POLICY "Admin can insert module items" ON module_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin can update module items" ON module_items;
CREATE POLICY "Admin can update module items" ON module_items
  FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- item_progress
DROP POLICY IF EXISTS "Students can read own item progress" ON item_progress;
CREATE POLICY "Students can read own item progress" ON item_progress
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.is_current_user_admin());

-- notifications
DROP POLICY IF EXISTS "Admin can read all notifications" ON notifications;
CREATE POLICY "Admin can read all notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_current_user_admin());

-- forum_messages
DROP POLICY IF EXISTS "Students can read forum messages" ON forum_messages;
CREATE POLICY "Students can read forum messages" ON forum_messages
  FOR SELECT TO authenticated
  USING (public.is_current_user_admin() OR EXISTS (
    SELECT 1 FROM class_enrollments ce
    WHERE ce.class_id = forum_messages.class_id
    AND ce.student_id = auth.uid()
    AND ce.access_granted = true
  ));

-- message_reactions
DROP POLICY IF EXISTS "Students can read message reactions" ON message_reactions;
CREATE POLICY "Students can read message reactions" ON message_reactions
  FOR SELECT TO authenticated
  USING (public.is_current_user_admin() OR EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN forum_messages fm ON fm.id = message_reactions.message_id
    WHERE ce.class_id = fm.class_id
    AND ce.student_id = auth.uid()
    AND ce.access_granted = true
  ));
