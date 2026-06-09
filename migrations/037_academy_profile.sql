-- =============================================================================
-- MIGRACIÓN 037: Khora Academia
-- Nuevas tablas: AcademyProfile, AcademyTeacher
-- Columnas añadidas: academy_id en TeacherProfile, StudentProfile,
--                   ClassType, LibraryContent, Payment, Booking
-- Funciones: is_academy(), get_my_academy_id(), my_teacher_academy_id()
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Actualizar CHECK constraint de User.role para incluir 'ACADEMY'
-- -----------------------------------------------------------------------------
ALTER TABLE public."User" DROP CONSTRAINT IF EXISTS "User_role_check";
ALTER TABLE public."User" ADD CONSTRAINT "User_role_check"
  CHECK (role IN ('TEACHER', 'STUDENT', 'ACADEMY'));

-- -----------------------------------------------------------------------------
-- 2. Crear tabla AcademyProfile
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."AcademyProfile" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url    TEXT,
  region      TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  plan        TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'pro'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3. Crear tabla AcademyTeacher (unión academia ↔ profesor)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."AcademyTeacher" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id  UUID NOT NULL REFERENCES public."AcademyProfile"(id) ON DELETE CASCADE,
  teacher_id  UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'INACTIVE'
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(academy_id, teacher_id)
);

-- -----------------------------------------------------------------------------
-- 4. Añadir academy_id a tablas existentes (sin tocar columnas existentes)
-- -----------------------------------------------------------------------------

-- TeacherProfile: null = profesor independiente, UUID = profesor de academia
ALTER TABLE public."TeacherProfile"
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public."AcademyProfile"(id) ON DELETE SET NULL;

-- StudentProfile: null = alumno de profesor independiente, UUID = alumno de academia
ALTER TABLE public."StudentProfile"
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public."AcademyProfile"(id) ON DELETE SET NULL;

-- ClassType: la academia puede crear sus propios tipos de clase (teacher_id pasa a nullable)
ALTER TABLE public."ClassType"
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public."AcademyProfile"(id) ON DELETE CASCADE;
ALTER TABLE public."ClassType"
  ALTER COLUMN teacher_id DROP NOT NULL;

-- LibraryContent: la academia puede subir contenido compartido (teacher_id pasa a nullable)
ALTER TABLE public."LibraryContent"
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public."AcademyProfile"(id) ON DELETE CASCADE;
ALTER TABLE public."LibraryContent"
  ALTER COLUMN teacher_id DROP NOT NULL;

-- Payment: para alumnos de academia, el pago va a la academia (teacher_id pasa a nullable)
ALTER TABLE public."Payment"
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public."AcademyProfile"(id) ON DELETE SET NULL;
ALTER TABLE public."Payment"
  ALTER COLUMN teacher_id DROP NOT NULL;

-- Booking: para bookings de academia
ALTER TABLE public."Booking"
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public."AcademyProfile"(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 5. Funciones helper
-- -----------------------------------------------------------------------------

-- ¿El usuario actual es admin de academia?
CREATE OR REPLACE FUNCTION public.is_academy()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role FROM public."User" WHERE id = auth.uid()) = 'ACADEMY',
    false
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Obtener el AcademyProfile.id del usuario actual (si es academia)
CREATE OR REPLACE FUNCTION public.get_my_academy_id()
RETURNS UUID AS $$
  SELECT id FROM public."AcademyProfile" WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Obtener el academy_id del profesor actual (si pertenece a una academia)
CREATE OR REPLACE FUNCTION public.my_teacher_academy_id()
RETURNS UUID AS $$
  SELECT academy_id FROM public."TeacherProfile" WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 6. RLS para AcademyProfile
-- -----------------------------------------------------------------------------
ALTER TABLE public."AcademyProfile" ENABLE ROW LEVEL SECURITY;

-- La academia puede ver y editar su propio perfil
DROP POLICY IF EXISTS "academy_owner_all" ON public."AcademyProfile";
CREATE POLICY "academy_owner_all" ON public."AcademyProfile"
  FOR ALL USING (user_id = auth.uid());

-- Cualquiera puede ver academias activas (para la página pública de booking)
DROP POLICY IF EXISTS "academy_anon_read" ON public."AcademyProfile";
CREATE POLICY "academy_anon_read" ON public."AcademyProfile"
  FOR SELECT USING (is_active = true);

-- El admin de Khora tiene acceso total
DROP POLICY IF EXISTS "admin_all_academies" ON public."AcademyProfile";
CREATE POLICY "admin_all_academies" ON public."AcademyProfile"
  FOR ALL USING (is_admin());

-- -----------------------------------------------------------------------------
-- 7. RLS para AcademyTeacher
-- -----------------------------------------------------------------------------
ALTER TABLE public."AcademyTeacher" ENABLE ROW LEVEL SECURITY;

-- La academia ve y gestiona sus profesores
DROP POLICY IF EXISTS "academy_teacher_academy_all" ON public."AcademyTeacher";
CREATE POLICY "academy_teacher_academy_all" ON public."AcademyTeacher"
  FOR ALL USING (academy_id = get_my_academy_id());

-- El profesor puede ver su propia vinculación
DROP POLICY IF EXISTS "academy_teacher_self_read" ON public."AcademyTeacher";
CREATE POLICY "academy_teacher_self_read" ON public."AcademyTeacher"
  FOR SELECT USING (
    teacher_id IN (
      SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid()
    )
  );

-- Admin total
DROP POLICY IF EXISTS "admin_all_academy_teachers" ON public."AcademyTeacher";
CREATE POLICY "admin_all_academy_teachers" ON public."AcademyTeacher"
  FOR ALL USING (is_admin());

-- -----------------------------------------------------------------------------
-- 8. Extender RLS existente para rol ACADEMY en tablas clave
-- -----------------------------------------------------------------------------

-- TeacherProfile: la academia ve sus propios profesores
DROP POLICY IF EXISTS "academy_sees_own_teachers" ON public."TeacherProfile";
CREATE POLICY "academy_sees_own_teachers" ON public."TeacherProfile"
  FOR SELECT USING (academy_id = get_my_academy_id());

-- StudentProfile: la academia ve sus propios alumnos
DROP POLICY IF EXISTS "academy_sees_own_students" ON public."StudentProfile";
CREATE POLICY "academy_sees_own_students" ON public."StudentProfile"
  FOR SELECT USING (academy_id = get_my_academy_id());

-- ClassType: la academia gestiona sus propios tipos de clase
DROP POLICY IF EXISTS "academy_manages_classtypes" ON public."ClassType";
CREATE POLICY "academy_manages_classtypes" ON public."ClassType"
  FOR ALL USING (academy_id = get_my_academy_id());

-- LibraryContent: la academia gestiona su biblioteca compartida
DROP POLICY IF EXISTS "academy_manages_library" ON public."LibraryContent";
CREATE POLICY "academy_manages_library" ON public."LibraryContent"
  FOR ALL USING (academy_id = get_my_academy_id());

-- LibraryContent: profesores de academia pueden leer la biblioteca compartida
DROP POLICY IF EXISTS "academy_teacher_reads_shared_library" ON public."LibraryContent";
CREATE POLICY "academy_teacher_reads_shared_library" ON public."LibraryContent"
  FOR SELECT USING (
    academy_id IS NOT NULL
    AND academy_id = my_teacher_academy_id()
  );

-- Payment: la academia ve todos sus pagos
DROP POLICY IF EXISTS "academy_manages_payments" ON public."Payment";
CREATE POLICY "academy_manages_payments" ON public."Payment"
  FOR ALL USING (academy_id = get_my_academy_id());

-- Booking: la academia ve y gestiona sus reservas
DROP POLICY IF EXISTS "academy_manages_bookings" ON public."Booking";
CREATE POLICY "academy_manages_bookings" ON public."Booking"
  FOR ALL USING (academy_id = get_my_academy_id());

-- ClassType: profesores de academia solo pueden leer (no editar) los tipos de su academia
DROP POLICY IF EXISTS "academy_teacher_reads_classtypes" ON public."ClassType";
CREATE POLICY "academy_teacher_reads_classtypes" ON public."ClassType"
  FOR SELECT USING (
    academy_id IS NOT NULL
    AND academy_id = my_teacher_academy_id()
  );

-- -----------------------------------------------------------------------------
-- 9. Actualizar trigger handle_new_user para soportar rol ACADEMY
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role        TEXT;
  v_name        TEXT;
  v_instrumento TEXT;
  v_region      TEXT;
  v_teacher_id  UUID;
  v_academy_id  UUID;
  v_slug        TEXT;
  v_counter     INTEGER := 1;
BEGIN
  v_role        := COALESCE(NEW.raw_user_meta_data ->> 'role', 'STUDENT');
  v_name        := COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1));
  v_instrumento := NEW.raw_user_meta_data ->> 'instrumento';
  v_region      := NEW.raw_user_meta_data ->> 'region';
  v_academy_id  := (NEW.raw_user_meta_data ->> 'academy_id')::UUID;

  -- 1. Crear registro en public.User
  INSERT INTO public."User" (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role)
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'TEACHER' THEN
    -- Generar slug único
    v_slug := public.slugify(v_name);
    WHILE EXISTS (SELECT 1 FROM public."TeacherProfile" WHERE slug = v_slug) LOOP
      v_slug    := public.slugify(v_name) || '-' || v_counter;
      v_counter := v_counter + 1;
    END LOOP;

    INSERT INTO public."TeacherProfile" (user_id, slug, instrumento, region, academy_id)
    VALUES (NEW.id, v_slug, v_instrumento, v_region, v_academy_id)
    ON CONFLICT (user_id) DO UPDATE
      SET instrumento = COALESCE(EXCLUDED.instrumento, public."TeacherProfile".instrumento),
          region      = COALESCE(EXCLUDED.region,      public."TeacherProfile".region),
          academy_id  = COALESCE(EXCLUDED.academy_id,  public."TeacherProfile".academy_id),
          slug        = COALESCE(public."TeacherProfile".slug, EXCLUDED.slug);

  ELSIF v_role = 'STUDENT' THEN
    v_teacher_id := (NEW.raw_user_meta_data ->> 'teacher_id')::UUID;

    IF v_teacher_id IS NULL THEN
      SELECT id INTO v_teacher_id
      FROM public."TeacherProfile"
      ORDER BY created_at ASC LIMIT 1;
    END IF;

    IF v_teacher_id IS NOT NULL THEN
      INSERT INTO public."StudentProfile" (user_id, teacher_id, academy_id)
      VALUES (NEW.id, v_teacher_id, v_academy_id)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;

  ELSIF v_role = 'ACADEMY' THEN
    -- Para el rol ACADEMY el AcademyProfile se crea manualmente por el admin de Khora
    -- No hay lógica automática aquí
    NULL;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user ERROR para % (id=%): %', NEW.email, NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
