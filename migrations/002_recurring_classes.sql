-- =============================================================================
-- KHORA V2.1 — CLASES RECURRENTES + PACKS MENSUALES
-- Ejecutar en SQL Editor de Supabase (NO destructivo, solo agrega)
-- =============================================================================

-- 1. Tabla Schedule: horario fijo semanal del alumno
CREATE TABLE IF NOT EXISTS public."Schedule" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  modalidad TEXT DEFAULT 'presencial',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Agregar columnas a Class (si no existen)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Class' AND column_name='schedule_id') THEN
    ALTER TABLE public."Class" ADD COLUMN schedule_id UUID REFERENCES public."Schedule"(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Class' AND column_name='is_recurring') THEN
    ALTER TABLE public."Class" ADD COLUMN is_recurring BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 3. Agregar columnas a Payment (si no existen)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Payment' AND column_name='payment_type') THEN
    ALTER TABLE public."Payment" ADD COLUMN payment_type TEXT DEFAULT 'SINGLE';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Payment' AND column_name='period_start') THEN
    ALTER TABLE public."Payment" ADD COLUMN period_start DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Payment' AND column_name='period_end') THEN
    ALTER TABLE public."Payment" ADD COLUMN period_end DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Payment' AND column_name='classes_included') THEN
    ALTER TABLE public."Payment" ADD COLUMN classes_included INTEGER DEFAULT 1;
  END IF;
END $$;

-- 4. RLS para Schedule
ALTER TABLE public."Schedule" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_teacher_all" ON public."Schedule" FOR ALL USING (public.is_teacher());
CREATE POLICY "schedule_own_read" ON public."Schedule" FOR SELECT USING (
  student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
);

-- 5. Hotfix: quitar FK de User → auth.users (para crear alumnos sin cuenta auth)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint
    WHERE conrelid = 'public."User"'::regclass
    AND confrelid = 'auth.users'::regclass AND contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE public."User" DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_schedule_student ON public."Schedule"(student_id);
CREATE INDEX IF NOT EXISTS idx_schedule_teacher ON public."Schedule"(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule ON public."Class"(schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_date ON public."Class"(date);
