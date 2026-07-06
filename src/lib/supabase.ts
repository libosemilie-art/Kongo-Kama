import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'student' | 'admin';
export type Division = 'kinkimba' | 'nzila_kongo';
export type ContentType = 'video' | 'pdf' | 'image' | 'audio' | 'text';
export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'other';
export type EnrollmentPaymentStatus = 'pending' | 'submitted' | 'validated' | 'rejected' | 'free' | 'awaiting_approval';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  phone: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  division: Division;
  is_free: boolean;
  is_restricted: boolean;
  requires_approval: boolean;
  cover_url: string;
  order_index: number;
  created_at: string;
}

export interface Class {
  id: string;
  course_id: string;
  name: string;
  description: string;
  access_code: string;
  is_active: boolean;
  max_students: number;
  created_at: string;
  courses?: Course;
}

export interface ClassEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  payment_status: EnrollmentPaymentStatus;
  access_granted: boolean;
  enrolled_at: string;
  classes?: Class;
}

export interface Module {
  id: string;
  class_id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  items?: ModuleItem[];
}

export interface ModuleItem {
  id: string;
  module_id: string;
  class_id: string;
  title: string;
  description: string;
  item_type: ContentType;
  content_url: string;
  content_body: string;
  duration_seconds: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export interface ItemProgress {
  id: string;
  item_id: string;
  student_id: string;
  completed: boolean;
  last_position_seconds: number;
  completed_at: string | null;
  last_accessed_at: string;
}

export interface Lesson {
  id: string;
  class_id: string;
  title: string;
  description: string;
  content_type: ContentType;
  content_url: string;
  content_body: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  student_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface Payment {
  id: string;
  enrollment_id: string;
  student_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  phone_number: string;
  reference_code: string;
  status: 'submitted' | 'validated' | 'rejected';
  admin_note: string;
  submitted_at: string;
  validated_at: string | null;
}

export interface ForumMessage {
  id: string;
  class_id: string;
  sender_id: string;
  content: string;
  audio_url: string;
  image_url: string;
  pdf_url: string;
  video_url: string;
  message_type: 'text' | 'audio';
  is_pinned: boolean;
  is_deleted: boolean;
  reply_to_id: string | null;
  created_at: string;
  profiles?: Profile;
  reply_to?: ForumMessage;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}
