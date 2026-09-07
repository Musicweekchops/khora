-- =============================================================================
-- MIGRACIÓN 048: Teacher Landing CMS (Completa y Auto-contenida)
-- Crea o actualiza LandingSetting, LandingTestimonial, LandingGalleryItem, LandingBio
-- Configura RLS y Storage para el bucket 'landing'
-- =============================================================================

-- 1. Crear tabla LandingSetting si no existe
CREATE TABLE IF NOT EXISTS public."LandingSetting" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL,
  value       JSONB NOT NULL DEFAULT '{}'::jsonb,
  teacher_id  UUID REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Si la tabla ya existía previamente sin alguna columna:
ALTER TABLE public."LandingSetting"
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Si 'key' era la Primary Key original (de la migración 023), migramos la PK a 'id'
-- para permitir que múltiples profesores tengan su propia fila con la misma 'key'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.key_column_usage
    WHERE table_schema = 'public'
      AND table_name = 'LandingSetting'
      AND constraint_name = 'LandingSetting_pkey'
      AND column_name = 'key'
  ) THEN
    ALTER TABLE public."LandingSetting" DROP CONSTRAINT "LandingSetting_pkey";
    ALTER TABLE public."LandingSetting" ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Crear restricción única (key, teacher_id) para habilitar upsert por profesor
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_landing_setting_key_teacher'
  ) THEN
    BEGIN
      ALTER TABLE public."LandingSetting"
        ADD CONSTRAINT uq_landing_setting_key_teacher UNIQUE NULLS NOT DISTINCT (key, teacher_id);
    EXCEPTION WHEN OTHERS THEN
      ALTER TABLE public."LandingSetting"
        ADD CONSTRAINT uq_landing_setting_key_teacher UNIQUE (key, teacher_id);
    END;
  END IF;
END $$;

-- 2. Crear tabla LandingTestimonial si no existe
CREATE TABLE IF NOT EXISTS public."LandingTestimonial" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT '',
  comment     TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  rating      INTEGER DEFAULT 5,
  "order"     INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Si ya existía sin teacher_id:
ALTER TABLE public."LandingTestimonial"
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE;

-- 3. Crear tabla LandingGalleryItem (fotos y videos del estudio por profesor)
CREATE TABLE IF NOT EXISTS public."LandingGalleryItem" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  caption     TEXT,
  "order"     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Crear tabla LandingBio (biografía y foto pública del profesor)
CREATE TABLE IF NOT EXISTS public."LandingBio" (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id   UUID UNIQUE NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  photo_url    TEXT,
  bio_text     TEXT,
  headline     TEXT,
  tags         TEXT[],
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE public."LandingSetting"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LandingTestimonial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LandingGalleryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LandingBio"         ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para LandingSetting
DROP POLICY IF EXISTS "Anyone can view landing settings" ON public."LandingSetting";
CREATE POLICY "Anyone can view landing settings" ON public."LandingSetting"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage landing settings" ON public."LandingSetting";
DROP POLICY IF EXISTS "Admins and teachers can manage landing settings" ON public."LandingSetting";
CREATE POLICY "Admins and teachers can manage landing settings" ON public."LandingSetting"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id = auth.uid() AND is_admin = true)
    OR (
      teacher_id IS NOT NULL AND
      teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
    )
  );

-- 7. Políticas RLS para LandingTestimonial
DROP POLICY IF EXISTS "Anyone can view landing testimonials" ON public."LandingTestimonial";
CREATE POLICY "Anyone can view landing testimonials" ON public."LandingTestimonial"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage landing testimonials" ON public."LandingTestimonial";
DROP POLICY IF EXISTS "Admins and teachers can manage landing testimonials" ON public."LandingTestimonial";
CREATE POLICY "Admins and teachers can manage landing testimonials" ON public."LandingTestimonial"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id = auth.uid() AND is_admin = true)
    OR (
      teacher_id IS NOT NULL AND
      teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
    )
  );

-- 8. Políticas RLS para LandingGalleryItem
DROP POLICY IF EXISTS "Public read gallery" ON public."LandingGalleryItem";
CREATE POLICY "Public read gallery" ON public."LandingGalleryItem"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teacher manages own gallery" ON public."LandingGalleryItem";
CREATE POLICY "Teacher manages own gallery" ON public."LandingGalleryItem"
  FOR ALL USING (
    teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public."User" WHERE id = auth.uid() AND is_admin = true)
  );

-- 9. Políticas RLS para LandingBio
DROP POLICY IF EXISTS "Public read bio" ON public."LandingBio";
CREATE POLICY "Public read bio" ON public."LandingBio"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teacher manages own bio" ON public."LandingBio";
CREATE POLICY "Teacher manages own bio" ON public."LandingBio"
  FOR ALL USING (
    teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public."User" WHERE id = auth.uid() AND is_admin = true)
  );

-- 10. Configurar Storage: bucket público 'landing'
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing', 'landing', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read for landing assets" ON storage.objects;
CREATE POLICY "Public Read for landing assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing');

DROP POLICY IF EXISTS "Admins can manage landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and admins can manage landing assets" ON storage.objects;
CREATE POLICY "Teachers and admins can manage landing assets"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'landing' AND (
    EXISTS (SELECT 1 FROM public."User" WHERE id = auth.uid() AND is_admin = true)
    OR EXISTS (SELECT 1 FROM public."TeacherProfile" WHERE user_id = auth.uid())
  )
);

-- 11. Recargar esquema para PostgREST
NOTIFY pgrst, 'reload schema';
