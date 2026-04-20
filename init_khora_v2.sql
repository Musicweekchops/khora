-- =========================================================================================
-- INIT KHORA V2 : EL NÚCLEO PERFECTO
-- Ejecuta esto en el SQL Editor de Supabase en un proyecto limpio (o tras borrar las tablas actuales).
-- =========================================================================================

-- 1. LIMPIEZA DE TABLAS PREVIAS (Orden inverso para evitar conflictos de llave foránea)
DROP TABLE IF EXISTS public."ClassNote" CASCADE;
DROP TABLE IF EXISTS public."Task" CASCADE;
DROP TABLE IF EXISTS public."Payment" CASCADE;
DROP TABLE IF EXISTS public."Class" CASCADE;
DROP TABLE IF EXISTS public."Booking" CASCADE;
DROP TABLE IF EXISTS public."AvailabilityException" CASCADE;
DROP TABLE IF EXISTS public."Availability" CASCADE;
DROP TABLE IF EXISTS public."ClassType" CASCADE;
DROP TABLE IF EXISTS public."StudentProfile" CASCADE;
DROP TABLE IF EXISTS public."TeacherProfile" CASCADE;
DROP TABLE IF EXISTS public."User" CASCADE;

-- Eliminar gatillos antiguos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_deleted_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_student_account() CASCADE;
DROP FUNCTION IF EXISTS public.is_teacher() CASCADE;

-- 2. DOMINIOS Y EXTENSIONES
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================================================
-- 3. CREACIÓN DE TABLAS (Usando UUID puros)
-- =========================================================================================

CREATE TABLE public."User" (
    "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT', -- 'TEACHER' o 'STUDENT'
    "password" TEXT, -- Reservado solo para integraciones locales si existieran, pero en V2 no se valida
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfil de Profesor
CREATE TABLE public."TeacherProfile" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "businessName" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfil de Alumno (Siempre pertenece a un Profesor)
CREATE TABLE public."StudentProfile" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "teacherId" UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
    "status" TEXT DEFAULT 'PROSPECT',
    "leadSource" TEXT,
    "modalidad" TEXT DEFAULT 'online',
    "preferredDay" TEXT,
    "preferredTime" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "lifetimeValue" NUMERIC DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos de Clase
CREATE TABLE public."ClassType" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "teacherId" UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "price" NUMERIC NOT NULL,
    "currency" TEXT DEFAULT 'USD',
    "duration" INTEGER NOT NULL, -- En minutos
    "color" TEXT DEFAULT '#000000',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disponibilidad Cíclica
CREATE TABLE public."Availability" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "teacherId" UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
    "dayOfWeek" INTEGER NOT NULL, -- 0 (Dom) a 6 (Sab)
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Excepciones de Disponibilidad
CREATE TABLE public."AvailabilityException" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "teacherId" UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
    "date" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "isAvailable" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agendamientos (Leads directos, antes de ser confirmados)
CREATE TABLE public."Booking" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classTypeId" UUID NOT NULL REFERENCES public."ClassType"(id) ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "date" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "totalPrice" NUMERIC DEFAULT 0,
    "status" TEXT DEFAULT 'PENDING',
    "isParent" BOOLEAN DEFAULT false,
    "isMonthlyPlan" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clases Asignadas
CREATE TABLE public."Class" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "teacherId" UUID REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
    "studentId" UUID REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
    "bookingId" UUID REFERENCES public."Booking"(id) ON DELETE CASCADE,
    "classTypeId" UUID REFERENCES public."ClassType"(id) ON DELETE CASCADE,
    "date" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "duration" INTEGER,
    "status" TEXT DEFAULT 'SCHEDULED',
    "modalidad" TEXT DEFAULT 'online',
    "needsRenewalReminder" BOOLEAN DEFAULT false,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public."ClassNote" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID NOT NULL REFERENCES public."Class"(id) ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tareas
CREATE TABLE public."Task" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID NOT NULL REFERENCES public."Class"(id) ON DELETE CASCADE,
    "studentId" UUID REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
    "teacherId" UUID REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN DEFAULT false,
    "status" TEXT DEFAULT 'todo',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pagos
CREATE TABLE public."Payment" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
    "teacherId" UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
    "amount" NUMERIC NOT NULL,
    "method" TEXT,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================================
-- 4. FUNCIÓN MÁGICA DE CREACIÓN DE ESTUDIANTES DIRECTO AL BÓVEDA (AUTH.USERS)
-- =========================================================================================

CREATE OR REPLACE FUNCTION public.create_student_account(
  new_email TEXT,
  new_password TEXT,
  new_name TEXT,
  new_phone TEXT,
  tgt_teacher_id UUID
) RETURNS UUID AS $$
DECLARE
  v_new_uuid UUID;
BEGIN
  v_new_uuid := gen_random_uuid();

  -- Insertamos directamente en el sistema de seguridad (auth.users)
  -- Encriptando la contraseña desde postgres y asignando la metadata clave
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_new_uuid,
    'authenticated',
    'authenticated',
    new_email,
    crypt(new_password, gen_salt('bf')),
    now(),
    jsonb_build_object(
      'name', new_name,
      'role', 'STUDENT',
      'teacherId', tgt_teacher_id
    ),
    now(),
    now()
  );

  RETURN v_new_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================================
-- 5. TRIGGER MAESTRO DE SINCRONIZACIÓN AUTOMÁTICA
-- =========================================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT');
  v_name TEXT := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
  v_teacherId_str TEXT := NEW.raw_user_meta_data->>'teacherId';
  v_teacherId UUID := NULL;
BEGIN
  IF v_teacherId_str IS NOT NULL THEN
     v_teacherId := v_teacherId_str::UUID;
  END IF;

  -- 1. Creamos al usuario puro
  INSERT INTO public."User" ("id", "email", "name", "role", "password")
  VALUES (NEW.id, NEW.email, v_name, v_role, '[MANAGED_BY_SUPABASE]')
  ON CONFLICT DO NOTHING;

  -- 2. Creamos perfiles
  IF v_role = 'TEACHER' THEN
    INSERT INTO public."TeacherProfile" ("userId") 
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  ELSE
    -- Asegurar que el estudiante siempre esté ligado a un maestro si se provee
    IF v_teacherId IS NOT NULL THEN
      INSERT INTO public."StudentProfile" ("userId", "teacherId") 
      VALUES (NEW.id, v_teacherId)
      ON CONFLICT DO NOTHING;
    ELSE
      -- Si viene huérfano (imposible con nuestra nueva arquitectura técnica) 
      -- Simplemente inserta esperando actualización
      INSERT INTO public."StudentProfile" ("userId") 
      VALUES (NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para purga universal
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public."User" WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_deleted_user();

-- =========================================================================================
-- 6. POLÍTICAS DE SEGURIDAD RLS (CERO RECURSIÓN)
-- =========================================================================================

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

-- FUNCIÓN DE VALIDACIÓN INSTANTÁNEA (ROMPE CICLOS INFINITOS)
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'TEACHER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos UNIVERSALES para Maestros
-- (El maestro puede Leer y Escribir en sus tablas si su JWT lo dice)
CREATE POLICY "Teacher Everything User" ON public."User" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything Teacher" ON public."TeacherProfile" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything Student" ON public."StudentProfile" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything ClassType" ON public."ClassType" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything Avail" ON public."Availability" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything AvailEx" ON public."AvailabilityException" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything Book" ON public."Booking" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything Class" ON public."Class" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything Note" ON public."ClassNote" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything Task" ON public."Task" FOR ALL USING (public.is_teacher());
CREATE POLICY "Teacher Everything Pay" ON public."Payment" FOR ALL USING (public.is_teacher());

-- Permisos de auto-lectura para Usuarios Base (Estudiantes)
CREATE POLICY "User Own Read" ON public."User" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Student Own Profile" ON public."StudentProfile" FOR SELECT USING (auth.uid() = "userId");

-- Permisos Anónimos (Requisito para web de agenda pública)
CREATE POLICY "Anon Read ClassType" ON public."ClassType" FOR SELECT USING (true);
CREATE POLICY "Anon Read Teacher" ON public."TeacherProfile" FOR SELECT USING (true);
CREATE POLICY "Anon Read Avail" ON public."Availability" FOR SELECT USING (true);
CREATE POLICY "Anon Read AvailEx" ON public."AvailabilityException" FOR SELECT USING (true);
CREATE POLICY "Anon Insert Booking" ON public."Booking" FOR INSERT WITH CHECK (true);
