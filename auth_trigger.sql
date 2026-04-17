-- AUTH CLONE TRIGGER
-- This ensures that when someone signs up via Supabase Auth, 
-- a record is created in our public "User" table.

-- 1. Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to execute when a new record is added to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Update RLS for public.User to allow users to read their own data
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own record" ON public."User";
CREATE POLICY "Users can read own record" ON public."User"
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Teachers can read all profiles" ON public."User";
CREATE POLICY "Teachers can read all profiles" ON public."User"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."User" 
      WHERE id::text = auth.uid()::text AND role = 'TEACHER'
    )
  );

-- 4. TeacherProfile Policies
ALTER TABLE public."TeacherProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can read own profile" ON public."TeacherProfile";
CREATE POLICY "Teachers can read own profile" ON public."TeacherProfile"
  FOR SELECT USING ("userId"::text = auth.uid()::text);

-- 5. StudentProfile Policies
ALTER TABLE public."StudentProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can read their students" ON public."StudentProfile";
CREATE POLICY "Teachers can read their students" ON public."StudentProfile"
  FOR SELECT USING (
    "teacherId" IN (
      SELECT id FROM public."TeacherProfile" WHERE "userId"::text = auth.uid()::text
    )
  );

-- 6. Payment Policies
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can read their students payments" ON public."Payment";
CREATE POLICY "Teachers can read their students payments" ON public."Payment"
  FOR SELECT USING (
    "studentId" IN (
      SELECT sp.id FROM public."StudentProfile" sp
      JOIN public."TeacherProfile" tp ON sp."teacherId" = tp.id
      WHERE tp."userId"::text = auth.uid()::text
    )
  );

-- 7. Class Policies
ALTER TABLE public."Class" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can read their own classes" ON public."Class";
CREATE POLICY "Teachers can read their own classes" ON public."Class"
  FOR SELECT USING (
    "teacherId" IN (
      SELECT id FROM public."TeacherProfile" WHERE "userId"::text = auth.uid()::text
    )
  );

-- 8. Booking Policies
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read bookings" ON public."Booking";
CREATE POLICY "Public can read bookings" ON public."Booking" FOR SELECT USING (true);
