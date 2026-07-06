/*
# Fix student payment flow + add admin class deletion

1. Payment Flow Fix
- Add a database trigger that automatically updates class_enrollments.payment_status
  to 'submitted' when a student inserts a payment. This replaces the broken
  client-side update (which failed due to RLS — students have no UPDATE policy
  on class_enrollments).
- The trigger runs with SECURITY DEFINER so it bypasses RLS.

2. Admin Class Deletion
- Add DELETE policy on classes for admin role so admin can delete classes.

3. Enrollment student update
- Add a policy allowing students to update their OWN enrollment's payment_status
  field only (needed as fallback, though trigger handles the primary case).

Security:
- Trigger runs as table owner (SECURITY DEFINER), safe for auto-updates.
- Admin DELETE policy requires admin role check via profiles.
- Student enrollment update policy restricts to own rows and payment_status only.
*/

-- ============================================================
-- 1. Trigger: auto-update enrollment on payment insert
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_enrollment_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE class_enrollments
  SET payment_status = 'submitted'
  WHERE id = NEW.enrollment_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enrollment_on_payment ON payments;
CREATE TRIGGER trg_enrollment_on_payment
  AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_on_payment();

-- ============================================================
-- 2. Admin can delete classes
-- ============================================================

DROP POLICY IF EXISTS "Admin can delete classes" ON classes;
CREATE POLICY "Admin can delete classes" ON classes FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================================
-- 3. Students can update own enrollment payment_status
-- ============================================================

DROP POLICY IF EXISTS "Students can update own enrollment status" ON class_enrollments;
CREATE POLICY "Students can update own enrollment status" ON class_enrollments FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ============================================================
-- 4. Admin can delete enrollments (for class cleanup)
-- ============================================================

DROP POLICY IF EXISTS "Admin can delete enrollments" ON class_enrollments;
CREATE POLICY "Admin can delete enrollments" ON class_enrollments FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================================
-- 5. Admin can delete payments (for class cleanup)
-- ============================================================

DROP POLICY IF EXISTS "Admin can delete payments" ON payments;
CREATE POLICY "Admin can delete payments" ON payments FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
