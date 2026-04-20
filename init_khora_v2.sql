-- =============================================================================
-- KHORA V2 — SCHEMA MAESTRO
-- Ejecutar en SQL Editor de un proyecto Supabase LIMPIO
-- =============================================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- TABLAS
-- =============================================================================

CREATE TABLE public."User" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('TEACHER','STUDENT')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."TeacherProfile" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."StudentProfile" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PROSPECT',
  lead_source TEXT,
  modalidad TEXT DEFAULT 'online',
  preferred_day TEXT,
  preferred_time TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  lifetime_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."ClassType" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎵',
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'CLP',
  duration INTEGER NOT NULL DEFAULT 60,
  color TEXT DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."Availability" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."AvailabilityException" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."Booking" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  class_type_id UUID NOT NULL REFERENCES public."ClassType"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  is_monthly_plan BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."Class" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public."StudentProfile"(id) ON DELETE SET NULL,
  class_type_id UUID REFERENCES public."ClassType"(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public."Booking"(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  status TEXT DEFAULT 'SCHEDULED',
  modalidad TEXT DEFAULT 'online',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."ClassNote" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public."Class"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."Task" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public."Class"(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public."StudentProfile"(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public."TeacherProfile"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."Payment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method TEXT,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- FUNCIONES
-- =============================================================================

-- Verificar rol TEACHER leyendo el JWT (NUNCA la tabla User → evita recursión)
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'TEACHER',
    false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Trigger: sincronizar auth.users → public.User + perfiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_teacher_id UUID;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'STUDENT');
  v_name := COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1));

  INSERT INTO public."User" (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role)
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'TEACHER' THEN
    INSERT INTO public."TeacherProfile" (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_role = 'STUDENT' THEN
    v_teacher_id := (NEW.raw_user_meta_data ->> 'teacher_id')::UUID;
    IF v_teacher_id IS NOT NULL THEN
      INSERT INTO public."StudentProfile" (user_id, teacher_id)
      VALUES (NEW.id, v_teacher_id)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: limpiar al borrar usuario
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public."User" WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_user();

-- RPC: profesor crea estudiante directamente en auth.users
CREATE OR REPLACE FUNCTION public.create_student_for_teacher(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_teacher_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_uid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_uid, 'authenticated', 'authenticated', p_email,
    crypt(p_password, gen_salt('bf')), now(),
    jsonb_build_object('name', p_name, 'role', 'STUDENT', 'teacher_id', p_teacher_id),
    now(), now(), '', ''
  );

  -- Actualizar phone en public.User (el trigger ya lo creó)
  IF p_phone IS NOT NULL THEN
    UPDATE public."User" SET phone = p_phone WHERE id = v_uid;
  END IF;

  RETURN v_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TeacherProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StudentProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ClassType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AvailabilityException" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ClassNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;

-- USER: el profesor lee todo, el alumno lee su propia fila
CREATE POLICY "user_teacher_all" ON public."User" FOR ALL USING (public.is_teacher());
CREATE POLICY "user_own_read" ON public."User" FOR SELECT USING (auth.uid() = id);

-- TEACHER PROFILE
CREATE POLICY "tp_teacher_all" ON public."TeacherProfile" FOR ALL USING (public.is_teacher());
CREATE POLICY "tp_own_read" ON public."TeacherProfile" FOR SELECT USING (auth.uid() = user_id);

-- STUDENT PROFILE
CREATE POLICY "sp_teacher_all" ON public."StudentProfile" FOR ALL USING (public.is_teacher());
CREATE POLICY "sp_own_read" ON public."StudentProfile" FOR SELECT USING (auth.uid() = user_id);

-- CLASS TYPE (público para lectura / agenda pública)
CREATE POLICY "ct_teacher_all" ON public."ClassType" FOR ALL USING (public.is_teacher());
CREATE POLICY "ct_anon_read" ON public."ClassType" FOR SELECT USING (true);

-- AVAILABILITY (público para lectura)
CREATE POLICY "av_teacher_all" ON public."Availability" FOR ALL USING (public.is_teacher());
CREATE POLICY "av_anon_read" ON public."Availability" FOR SELECT USING (true);

-- AVAILABILITY EXCEPTION (público para lectura)
CREATE POLICY "ae_teacher_all" ON public."AvailabilityException" FOR ALL USING (public.is_teacher());
CREATE POLICY "ae_anon_read" ON public."AvailabilityException" FOR SELECT USING (true);

-- BOOKING (público para insertar, profesor para gestionar)
CREATE POLICY "bk_teacher_all" ON public."Booking" FOR ALL USING (public.is_teacher());
CREATE POLICY "bk_anon_insert" ON public."Booking" FOR INSERT WITH CHECK (true);
CREATE POLICY "bk_anon_read_class" ON public."Booking" FOR SELECT USING (true);

-- CLASS
CREATE POLICY "cl_teacher_all" ON public."Class" FOR ALL USING (public.is_teacher());
CREATE POLICY "cl_anon_read" ON public."Class" FOR SELECT USING (true);

-- CLASS NOTE
CREATE POLICY "cn_teacher_all" ON public."ClassNote" FOR ALL USING (public.is_teacher());

-- TASK
CREATE POLICY "tk_teacher_all" ON public."Task" FOR ALL USING (public.is_teacher());
CREATE POLICY "tk_student_read" ON public."Task" FOR SELECT USING (
  student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
);

-- PAYMENT
CREATE POLICY "py_teacher_all" ON public."Payment" FOR ALL USING (public.is_teacher());
