-- =========================================================================
-- FIX AUTH TRIGGER AND RLS POLICIES FOR KHORA SaaS
-- Execute this script directly in the Supabase SQL Editor
-- =========================================================================

-- 1. DROP EXISTING TRIGGERS TO PREVENT CONFLICTS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. CREATE A ROBUST TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into User table securely casting to TEXT (Matches Prisma/Next.js)
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

  -- If TEACHER, ensure TeacherProfile is created
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT') = 'TEACHER' THEN
    IF NOT EXISTS (SELECT 1 FROM public."TeacherProfile" WHERE "userId" = NEW.id::text) THEN
      INSERT INTO public."TeacherProfile" ("id", "userId", "updatedAt") 
      VALUES (gen_random_uuid()::text, NEW.id::text, NOW());
    END IF;
  END IF;

  -- If STUDENT, ensure StudentProfile is created
  -- (This ensures students can be associated to classes when they register)
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT') = 'STUDENT' THEN
    IF NOT EXISTS (SELECT 1 FROM public."StudentProfile" WHERE "userId" = NEW.id::text) THEN
      INSERT INTO public."StudentProfile" ("id", "userId", "updatedAt") 
      VALUES (gen_random_uuid()::text, NEW.id::text, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. BIND THE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =========================================================================
-- 4. FIX ROW LEVEL SECURITY (RLS) FOR MANAGEMENT OPERATIONS
-- =========================================================================

-- Enable RLS Globally on all main tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TeacherProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StudentProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ClassType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Task" ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- A. USER TABLE POLICIES
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own record" ON public."User";
CREATE POLICY "Users can read own record" ON public."User"
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own record" ON public."User";
CREATE POLICY "Users can update own record" ON public."User"
  FOR UPDATE USING (auth.uid()::text = id::text) WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Teachers can view all profiles" ON public."User";
CREATE POLICY "Teachers can view all profiles" ON public."User"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id::text = auth.uid()::text AND role = 'TEACHER')
  );

-- -------------------------------------------------------------------------
-- B. TEACHER PROFILE POLICIES
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Teachers can read own profile" ON public."TeacherProfile";
CREATE POLICY "Teachers can read own profile" ON public."TeacherProfile"
  FOR SELECT USING ("userId"::text = auth.uid()::text);

DROP POLICY IF EXISTS "Teachers can update own profile" ON public."TeacherProfile";
CREATE POLICY "Teachers can update own profile" ON public."TeacherProfile"
  FOR UPDATE USING ("userId"::text = auth.uid()::text) WITH CHECK ("userId"::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public can read teacher profiles" ON public."TeacherProfile";
CREATE POLICY "Public can read teacher profiles" ON public."TeacherProfile"
  FOR SELECT USING (true);


-- -------------------------------------------------------------------------
-- C. STUDENT PROFILE POLICIES
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can read own profile" ON public."StudentProfile";
CREATE POLICY "Students can read own profile" ON public."StudentProfile"
  FOR SELECT USING ("userId"::text = auth.uid()::text);

DROP POLICY IF EXISTS "Students can update own profile" ON public."StudentProfile";
CREATE POLICY "Students can update own profile" ON public."StudentProfile"
  FOR UPDATE USING ("userId"::text = auth.uid()::text) WITH CHECK ("userId"::text = auth.uid()::text);

-- Maestros tienen control total de los Alumnos
DROP POLICY IF EXISTS "Teachers full access to students" ON public."StudentProfile";
CREATE POLICY "Teachers full access to students" ON public."StudentProfile"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id::text = auth.uid()::text AND role = 'TEACHER')
  );


-- -------------------------------------------------------------------------
-- D. CLASS POLICIES
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can view own classes" ON public."Class";
CREATE POLICY "Students can view own classes" ON public."Class"
  FOR SELECT USING (
    "studentId" IN (SELECT id FROM public."StudentProfile" WHERE "userId"::text = auth.uid()::text)
  );

-- Maestros tienen control total de las Clases
DROP POLICY IF EXISTS "Teachers full access to classes" ON public."Class";
CREATE POLICY "Teachers full access to classes" ON public."Class"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id::text = auth.uid()::text AND role = 'TEACHER')
  );


-- -------------------------------------------------------------------------
-- E. PAYMENT POLICIES
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can view own payments" ON public."Payment";
CREATE POLICY "Students can view own payments" ON public."Payment"
  FOR SELECT USING (
    "studentId" IN (SELECT id FROM public."StudentProfile" WHERE "userId"::text = auth.uid()::text)
  );

-- Maestros tienen control total de los Pagos
DROP POLICY IF EXISTS "Teachers full access to payments" ON public."Payment";
CREATE POLICY "Teachers full access to payments" ON public."Payment"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id::text = auth.uid()::text AND role = 'TEACHER')
  );


-- -------------------------------------------------------------------------
-- F. SUPPORT & BOOKING POLICIES (Booking, Availability, ClassType, Task)
-- -------------------------------------------------------------------------

-- Bookings (Público puede insertar)
DROP POLICY IF EXISTS "Public can insert bookings" ON public."Booking";
CREATE POLICY "Public can insert bookings" ON public."Booking"
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Teachers full access to bookings" ON public."Booking";
CREATE POLICY "Teachers full access to bookings" ON public."Booking"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id::text = auth.uid()::text AND role = 'TEACHER')
  );

DROP POLICY IF EXISTS "Public can view bookings" ON public."Booking";
CREATE POLICY "Public can view bookings" ON public."Booking" FOR SELECT USING (true);


-- ClassType (Lectura pública, Manejo por Maestros)
DROP POLICY IF EXISTS "Public can read ClassType" ON public."ClassType";
CREATE POLICY "Public can read ClassType" ON public."ClassType" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers full access to ClassType" ON public."ClassType";
CREATE POLICY "Teachers full access to ClassType" ON public."ClassType"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id::text = auth.uid()::text AND role = 'TEACHER')
  );


-- Availability (Lectura pública, Manejo por Maestros)
DROP POLICY IF EXISTS "Public can read Availability" ON public."Availability";
CREATE POLICY "Public can read Availability" ON public."Availability" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers full access to Availability" ON public."Availability";
CREATE POLICY "Teachers full access to Availability" ON public."Availability"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id::text = auth.uid()::text AND role = 'TEACHER')
  );


-- Tasks (Manejo por Maestros y Administradores)
DROP POLICY IF EXISTS "Teachers full access to Tasks" ON public."Task";
CREATE POLICY "Teachers full access to Tasks" ON public."Task"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id::text = auth.uid()::text AND role = 'TEACHER')
  );

-- COMPLETED.
