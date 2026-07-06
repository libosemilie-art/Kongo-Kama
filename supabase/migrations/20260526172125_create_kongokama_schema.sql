
/*
  # Kongokama Platform — Full Schema

  ## Tables Created (in dependency order)
  1. profiles — user roles, extended user data
  2. courses — course catalog with division (kinkimba / nzila_kongo)
  3. classes — teacher-created class instances with access codes
  4. class_enrollments — student memberships with payment status
  5. lessons — course content (video, pdf, image, text)
  6. lesson_progress — per-student lesson completion
  7. payments — mobile money payment records
  8. forum_messages — class-based forum/chat messages

  ## Security
  - RLS enabled on all tables
  - Students access only their own data and enrolled class data
  - Admin has elevated access via role check in profiles table
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  division text NOT NULL CHECK (division IN ('kinkimba', 'nzila_kongo')),
  is_free boolean DEFAULT false,
  is_restricted boolean DEFAULT false,
  cover_url text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read courses"
  ON courses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can insert courses"
  ON courses FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update courses"
  ON courses FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- classes
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  access_code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  max_students integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- class_enrollments (must exist before classes policy references it)
CREATE TABLE IF NOT EXISTS class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'submitted', 'validated', 'rejected', 'free')),
  access_granted boolean DEFAULT false,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- Now add classes policies that reference class_enrollments
CREATE POLICY "Enrolled students can read their classes"
  ON classes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = classes.id
      AND class_enrollments.student_id = auth.uid()
      AND class_enrollments.access_granted = true
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can insert classes"
  ON classes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update classes"
  ON classes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- class_enrollments policies
CREATE POLICY "Students can read own enrollments"
  ON class_enrollments FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Students can insert own enrollment"
  ON class_enrollments FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admin can update enrollments"
  ON class_enrollments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- lessons
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  content_type text NOT NULL CHECK (content_type IN ('video', 'pdf', 'image', 'text')),
  content_url text DEFAULT '',
  content_body text DEFAULT '',
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students can read lessons"
  ON lessons FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = lessons.class_id
      AND class_enrollments.student_id = auth.uid()
      AND class_enrollments.access_granted = true
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can insert lessons"
  ON lessons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update lessons"
  ON lessons FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- lesson_progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(lesson_id, student_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own progress"
  ON lesson_progress FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Students can insert own progress"
  ON lesson_progress FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own progress"
  ON lesson_progress FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES class_enrollments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  payment_method text NOT NULL CHECK (payment_method IN ('mtn_momo', 'airtel_money', 'other')),
  phone_number text DEFAULT '',
  reference_code text DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'validated', 'rejected')),
  admin_note text DEFAULT '',
  submitted_at timestamptz DEFAULT now(),
  validated_at timestamptz
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own payments"
  ON payments FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Students can insert own payment"
  ON payments FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admin can update payments"
  ON payments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- forum_messages
CREATE TABLE IF NOT EXISTS forum_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text DEFAULT '',
  audio_url text DEFAULT '',
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'audio')),
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students can read forum messages"
  ON forum_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = forum_messages.class_id
      AND class_enrollments.student_id = auth.uid()
      AND class_enrollments.access_granted = true
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Enrolled students can send messages"
  ON forum_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM class_enrollments
        WHERE class_enrollments.class_id = forum_messages.class_id
        AND class_enrollments.student_id = auth.uid()
        AND class_enrollments.access_granted = true
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Admin can update forum messages"
  ON forum_messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed courses
INSERT INTO courses (title, slug, description, division, is_free, is_restricted, order_index) VALUES
  ('Kikongo kia me ntêle (Kilari)', 'kikongo-kilari', 'Cours de Kikongo niveau débutant — la voie de la compréhension de base.', 'kinkimba', false, false, 1),
  ('Kikongo kia mono (Kikongo kia kati)', 'kikongo-kati', 'Cours de Kikongo intermédiaire — approfondissement de la langue sacrée.', 'kinkimba', false, false, 2),
  ('Nzila Kongo — Spiritualité', 'nzila-kongo-spiritualite', 'Initiation à la spiritualité Kongo, enseignements ancestraux.', 'nzila_kongo', true, false, 3),
  ('Nzila Kongo — Accès Restreint', 'nzila-kongo-restreint', 'Enseignements initiatiques profonds — accès par code spécial uniquement.', 'nzila_kongo', true, true, 4)
ON CONFLICT (slug) DO NOTHING;
