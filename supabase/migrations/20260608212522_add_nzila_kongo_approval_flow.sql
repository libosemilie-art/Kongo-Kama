
-- Add requires_approval flag to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false;

-- Update Nzila Kongo courses: no longer free, requires approval
UPDATE courses SET is_free = false, requires_approval = true
WHERE division = 'nzila_kongo';

-- Allow awaiting_approval in the check constraint on class_enrollments
ALTER TABLE class_enrollments DROP CONSTRAINT IF EXISTS class_enrollments_payment_status_check;
ALTER TABLE class_enrollments ADD CONSTRAINT class_enrollments_payment_status_check
  CHECK (payment_status IN ('pending', 'submitted', 'validated', 'rejected', 'free', 'awaiting_approval'));
