/*
# Auto-create profile on signup

Adds a database trigger that automatically creates a profile row
when a new user is inserted into auth.users. This is more reliable
than client-side insert because:
1. It runs with elevated privileges (bypasses RLS)
2. No timing issues with auth.uid() after signUp
3. Guarantees profile exists before any client query

Also adds a default of auth.uid() on profiles.id so client inserts
that omit the id still work.
*/

-- Add default to profiles.id
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT auth.uid();

-- Function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'student'
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
