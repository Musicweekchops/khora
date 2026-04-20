CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the base User record securely casting everything to TEXT to match Prisma
  -- CRITICAL FIX: prisma schema requires "password" and "updatedAt" to be NOT NULL!
  -- We must inject dummy/timestamp values to satisfy the legacy NextAuth schema constraints.
  INSERT INTO public."User" ("id", "email", "name", "role", "password", "updatedAt")
  VALUES (
    NEW.id::text, 
    NEW.email::text, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email::text), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
    '[MANAGED_BY_SUPABASE_AUTH]',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    "updatedAt" = NOW();

  -- Create the TeacherProfile if the role is TEACHER
  -- CRITICAL FIX: We must manually supply "id" (gen_random_uuid) because Prisma previously handled it in Node.js!
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT') = 'TEACHER' THEN
    IF NOT EXISTS (SELECT 1 FROM public."TeacherProfile" WHERE "userId" = NEW.id::text) THEN
      INSERT INTO public."TeacherProfile" ("id", "userId", "updatedAt") 
      VALUES (gen_random_uuid()::text, NEW.id::text, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;