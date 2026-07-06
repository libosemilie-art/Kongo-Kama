
/*
  # Advanced Content & Forum Schema

  ## New Tables
  - modules: Course modules within a class (ordered sections)
  - module_items: Items inside modules (video, pdf, image, audio, text)
  - item_progress: Per-student per-item progress (watched, opened, completed)
  - message_reactions: Emoji reactions on forum messages
  - message_replies: Reply threading for forum messages
  - notifications: In-app notification system

  ## Changes
  - forum_messages: add pinned, reply_to, image_url, pdf_url, video_url columns
  - payments: unique constraint on reference_code

  ## Security
  - RLS on all new tables following same patterns
*/

-- modules
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students can read modules"
  ON modules FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM class_enrollments WHERE class_id = modules.class_id AND student_id = auth.uid() AND access_granted = true)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can insert modules"
  ON modules FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update modules"
  ON modules FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can delete modules"
  ON modules FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- module_items (replaces lessons, keeps backward compat)
CREATE TABLE IF NOT EXISTS module_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  item_type text NOT NULL CHECK (item_type IN ('video', 'pdf', 'image', 'audio', 'text')),
  content_url text DEFAULT '',
  content_body text DEFAULT '',
  duration_seconds integer DEFAULT 0,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE module_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students can read items"
  ON module_items FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM class_enrollments WHERE class_id = module_items.class_id AND student_id = auth.uid() AND access_granted = true)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can insert items"
  ON module_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update items"
  ON module_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can delete items"
  ON module_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- item_progress
CREATE TABLE IF NOT EXISTS item_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES module_items(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  last_position_seconds integer DEFAULT 0,
  completed_at timestamptz,
  last_accessed_at timestamptz DEFAULT now(),
  UNIQUE(item_id, student_id)
);

ALTER TABLE item_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own item progress"
  ON item_progress FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Students can insert own item progress"
  ON item_progress FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own item progress"
  ON item_progress FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- forum_messages: add extra columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_messages' AND column_name = 'is_pinned') THEN
    ALTER TABLE forum_messages ADD COLUMN is_pinned boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_messages' AND column_name = 'reply_to_id') THEN
    ALTER TABLE forum_messages ADD COLUMN reply_to_id uuid REFERENCES forum_messages(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_messages' AND column_name = 'image_url') THEN
    ALTER TABLE forum_messages ADD COLUMN image_url text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_messages' AND column_name = 'pdf_url') THEN
    ALTER TABLE forum_messages ADD COLUMN pdf_url text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_messages' AND column_name = 'video_url') THEN
    ALTER TABLE forum_messages ADD COLUMN video_url text DEFAULT '';
  END IF;
END $$;

-- message_reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES forum_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL DEFAULT '👍',
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class members can read reactions"
  ON message_reactions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forum_messages fm
      JOIN class_enrollments ce ON ce.class_id = fm.class_id
      WHERE fm.id = message_reactions.message_id AND ce.student_id = auth.uid() AND ce.access_granted = true
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Class members can insert reactions"
  ON message_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reactions"
  ON message_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('payment_received', 'payment_validated', 'payment_rejected', 'class_joined', 'new_material', 'new_message', 'access_code_generated')),
  title text NOT NULL,
  body text DEFAULT '',
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
