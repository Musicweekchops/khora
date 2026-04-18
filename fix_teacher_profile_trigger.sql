-- Run this in your Supabase SQL Editor to fix the missing TeacherProfile creation

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the base User record
  INSERT INTO public."User" (id, email, name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;

  -- Crucial Fix: Automatically create the TeacherProfile if the role is TEACHER
  -- Before the static migration, this was done by Next.js in /api/register.
  IF NEW.raw_user_meta_data->>'role' = 'TEACHER' THEN
    INSERT INTO public."TeacherProfile" ("userId") 
    VALUES (NEW.id) 
    ON CONFLICT ("userId") DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
