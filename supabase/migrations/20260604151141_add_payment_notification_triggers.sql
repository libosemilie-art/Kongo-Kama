/*
  # Add payment notification triggers

  ## Summary
  Creates PostgreSQL functions and triggers that automatically insert rows
  into the `notifications` table when payment status changes occur.

  ## Triggers

  1. **payment_submitted** — When a student submits a payment, notify the admin
     (all profiles with role='admin') that a new payment was received.

  2. **payment_status_changed** — When an admin updates a payment to 'validated'
     or 'rejected', notify the student (enrollment owner) of the decision.

  ## Notes
  - Notifications are inserted directly from the trigger — no edge function needed.
  - `metadata` stores the payment_id and enrollment_id for deep linking.
  - Trigger fires AFTER INSERT/UPDATE so the new row is already committed.
*/

-- Function: notify admin on new payment submission
CREATE OR REPLACE FUNCTION notify_payment_received()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id uuid;
  v_student_name text;
  v_class_name text;
BEGIN
  -- Get student name
  SELECT full_name INTO v_student_name FROM profiles WHERE id = NEW.student_id;

  -- Get class name via enrollment
  SELECT c.name INTO v_class_name
  FROM class_enrollments ce
  JOIN classes c ON c.id = ce.class_id
  WHERE ce.id = NEW.enrollment_id
  LIMIT 1;

  -- Notify all admins
  FOR v_admin_id IN SELECT id FROM profiles WHERE role = 'admin' LOOP
    INSERT INTO notifications (user_id, type, title, body, metadata)
    VALUES (
      v_admin_id,
      'payment_received',
      'Nouveau paiement recu',
      COALESCE(v_student_name, 'Un etudiant') || ' a soumis un paiement pour ' || COALESCE(v_class_name, 'une classe') || '.',
      jsonb_build_object('payment_id', NEW.id, 'enrollment_id', NEW.enrollment_id, 'student_id', NEW.student_id)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: notify student on payment validation or rejection
CREATE OR REPLACE FUNCTION notify_payment_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id uuid;
  v_class_name text;
BEGIN
  -- Only fire when status changes to validated or rejected
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;
  IF NEW.status NOT IN ('validated', 'rejected') THEN
    RETURN NEW;
  END IF;

  -- Get student_id from enrollment
  SELECT ce.student_id, c.name
  INTO v_student_id, v_class_name
  FROM class_enrollments ce
  JOIN classes c ON c.id = ce.class_id
  WHERE ce.id = NEW.enrollment_id
  LIMIT 1;

  IF v_student_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, type, title, body, metadata)
  VALUES (
    v_student_id,
    CASE NEW.status WHEN 'validated' THEN 'payment_validated' ELSE 'payment_rejected' END,
    CASE NEW.status
      WHEN 'validated' THEN 'Paiement valide !'
      ELSE 'Paiement refuse'
    END,
    CASE NEW.status
      WHEN 'validated' THEN 'Votre paiement pour ' || COALESCE(v_class_name, 'votre classe') || ' a ete valide. Vous avez maintenant acces au cours.'
      ELSE 'Votre paiement pour ' || COALESCE(v_class_name, 'votre classe') || ' n''a pas pu etre valide. Contactez l''administrateur.'
    END,
    jsonb_build_object('payment_id', NEW.id, 'enrollment_id', NEW.enrollment_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers
DROP TRIGGER IF EXISTS trg_payment_received ON payments;
CREATE TRIGGER trg_payment_received
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_received();

DROP TRIGGER IF EXISTS trg_payment_status_changed ON payments;
CREATE TRIGGER trg_payment_status_changed
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_status_changed();
