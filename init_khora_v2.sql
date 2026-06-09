-- =============================================================================
-- KHORA V2 — SCHEMA MAESTRO
-- Ejecutar en SQL Editor de Supabase (funciona en proyecto limpio o sucio)
-- =============================================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =============================================================================
-- PASO 1: CREAR TABLAS (Solo si no existen)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public."User" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('TEACHER','STUDENT')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."TeacherProfile" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  business_name TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_profile_slug ON public."TeacherProfile"(slug);

CREATE TABLE IF NOT EXISTS public."StudentProfile" (
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
  is_recurring BOOLEAN DEFAULT false,
  recurring_group_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."ClassNote" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public."Class"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public."LibraryContent" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('VIDEO', 'PDF', 'EXERCISE')),
  url TEXT NOT NULL,
  category TEXT,
  is_public BOOLEAN DEFAULT true,
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
-- Revisa multiples paths donde Supabase puede colocar el rol
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'TEACHER',
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'TEACHER',
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'TEACHER',
    false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.slugify(value TEXT)
RETURNS TEXT AS $$
  SELECT regexp_replace(
    regexp_replace(
      lower(public.unaccent(value)),
      '[^a-z0-9\-_]+', '-', 'gi'
    ),
    '^-+|-+$', '', 'g'
  );
$$ LANGUAGE SQL IMMUTABLE STRICT;

-- Trigger: sincronizar auth.users → public.User + perfiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_teacher_id UUID;
  v_slug TEXT;
  v_counter INTEGER := 1;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'STUDENT');
  v_name := COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1));

  INSERT INTO public."User" (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role)
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'TEACHER' THEN
    v_slug := public.slugify(v_name);
    
    WHILE EXISTS (SELECT 1 FROM public."TeacherProfile" WHERE slug = v_slug) LOOP
      v_slug := public.slugify(v_name) || '-' || v_counter;
      v_counter := v_counter + 1;
    END LOOP;

    INSERT INTO public."TeacherProfile" (user_id, slug)
    VALUES (NEW.id, v_slug)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_role = 'STUDENT' THEN
    -- Intentar obtener teacher_id de metadata
    v_teacher_id := (NEW.raw_user_meta_data ->> 'teacher_id')::UUID;
    
    -- AUTOMATIZACIÓN: Si no hay teacher_id (creación manual), asignar el primer profesor disponible
    IF v_teacher_id IS NULL THEN
      SELECT id INTO v_teacher_id FROM public."TeacherProfile" ORDER BY created_at ASC LIMIT 1;
    END IF;

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
-- SECURITY DEFINER = ejecuta con permisos del owner (postgres), no del caller
CREATE OR REPLACE FUNCTION public.create_student_for_teacher(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_teacher_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_uid UUID := gen_random_uuid();
  v_encrypted TEXT;
BEGIN
  -- Validar que el email no exista
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'El email % ya está registrado', p_email;
  END IF;

  -- Encriptar password
  v_encrypted := crypt(p_password, gen_salt('bf'));

  -- Insertar en auth.users (compatible con Supabase GoTrue v2+)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data,
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_uid, 'authenticated', 'authenticated', p_email,
    v_encrypted, now(),
    jsonb_build_object('name', p_name, 'role', 'STUDENT', 'teacher_id', p_teacher_id),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    now(), now()
  );

  -- Insertar identidad (requerido en Supabase GoTrue reciente)
  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_uid, v_uid::text, 'email',
    jsonb_build_object('sub', v_uid::text, 'email', p_email),
    now(), now(), now()
  );

  -- El trigger on_auth_user_created crea User + StudentProfile automáticamente
  -- Actualizamos phone si se proporcionó
  IF p_phone IS NOT NULL THEN
    UPDATE public."User" SET phone = p_phone WHERE id = v_uid;
  END IF;

  RETURN v_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: profesor restablece contraseña de un alumno
CREATE OR REPLACE FUNCTION public.reset_student_password(
  p_user_id UUID,
  p_new_password TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Validar que el que llama sea profesor
  IF NOT public.is_teacher() THEN
    RAISE EXCEPTION 'Solo los profesores pueden restablecer contraseñas.';
  END IF;

  UPDATE auth.users 
  SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: profesor actualiza email de estudiante en auth.users y public.User
CREATE OR REPLACE FUNCTION public.update_student_email(
  p_user_id UUID,
  p_new_email TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_teacher_id UUID;
  v_student_teacher_id UUID;
BEGIN
  -- 1. Validar que el que llama sea profesor
  IF NOT public.is_teacher() THEN
    RAISE EXCEPTION 'Solo los profesores pueden actualizar emails de estudiantes.';
  END IF;

  -- 2. Obtener el teacher_id del que llama
  SELECT id INTO v_teacher_id 
  FROM public."TeacherProfile" 
  WHERE user_id = auth.uid();

  -- 3. Obtener el teacher_id del estudiante
  SELECT teacher_id INTO v_student_teacher_id
  FROM public."StudentProfile"
  WHERE user_id = p_user_id;

  IF v_teacher_id IS NULL OR v_student_teacher_id IS NULL OR v_teacher_id <> v_student_teacher_id THEN
    RAISE EXCEPTION 'No tienes permiso para actualizar este estudiante.';
  END IF;

  -- 4. Validar que el email no esté registrado por otro usuario
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_new_email AND id <> p_user_id) THEN
    RAISE EXCEPTION 'El email % ya está registrado por otro usuario.', p_new_email;
  END IF;

  -- 5. Actualizar en auth.users
  UPDATE auth.users 
  SET email = p_new_email,
      email_confirmed_at = now(),
      updated_at = now()
  WHERE id = p_user_id;

  -- 6. Actualizar en public.User
  UPDATE public."User"
  SET email = p_new_email
  WHERE id = p_user_id;

  RETURN TRUE;
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
