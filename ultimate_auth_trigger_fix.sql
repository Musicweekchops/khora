CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the base User record securely casting everything to TEXT to match Prisma
  INSERT INTO public."User" (id, email, name, role)
  VALUES (
    NEW.id::text, 
    NEW.email::text, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email::text), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;

  -- Create the TeacherProfile if the role is TEACHER
  -- CRITICAL FIX: We must manually supply "id" (gen_random_uuid) because Prisma previously handled it in Node.js!
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT') = 'TEACHER' THEN
    IF NOT EXISTS (SELECT 1 FROM public."TeacherProfile" WHERE "userId" = NEW.id::text) THEN
      INSERT INTO public."TeacherProfile" ("id", "userId") 
      VALUES (gen_random_uuid()::text, NEW.id::text);
    END IF;
  END IF;

  -- Create the StudentProfile if the role is STUDENT
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT') = 'STUDENT' THEN
    IF NOT EXISTS (SELECT 1 FROM public."StudentProfile" WHERE "userId" = NEW.id::text) THEN
      INSERT INTO public."StudentProfile" ("id", "userId") 
      VALUES (gen_random_uuid()::text, NEW.id::text);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
