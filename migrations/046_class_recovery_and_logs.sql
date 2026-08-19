-- =============================================================================
-- Migración 046: Clases de recuperación con fecha original y sistema de bitácora ClassLog
-- =============================================================================

-- 1. Añadir columnas a Class si no existen
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Class' AND column_name='original_class_date') THEN
    ALTER TABLE public."Class" ADD COLUMN original_class_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Class' AND column_name='is_recovery') THEN
    ALTER TABLE public."Class" ADD COLUMN is_recovery BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 2. Crear tabla ClassLog para la bitácora de eventos de la clase / alumno
CREATE TABLE IF NOT EXISTS public."ClassLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public."Class"(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'CLASS_CREATED', 'ATTENDANCE_MARKED', 'STATUS_CHANGED', 'RESCHEDULED', 'RECOVERY_SCHEDULED', 'NOTE_ADDED', 'PAYMENT_REGISTERED'
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- 3. Índices para agilizar la carga de bitácoras por clase y por alumno
CREATE INDEX IF NOT EXISTS idx_class_log_student ON public."ClassLog"(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_class_log_class ON public."ClassLog"(class_id, created_at DESC);

-- 4. RLS para ClassLog
ALTER TABLE public."ClassLog" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "class_log_teacher_all" ON public."ClassLog";
CREATE POLICY "class_log_teacher_all" ON public."ClassLog" FOR ALL USING (public.is_teacher());

DROP POLICY IF EXISTS "class_log_student_read" ON public."ClassLog";
CREATE POLICY "class_log_student_read" ON public."ClassLog" FOR SELECT USING (
  student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
);
