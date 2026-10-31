-- =============================================================================
-- Migración 055: Funnel de Nutrición Lineal Infinito con Atribución de Ventas
-- =============================================================================

CREATE TABLE IF NOT EXISTS public."NurtureStep" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 7,
  target_audiences TEXT[] NOT NULL DEFAULT ARRAY['PROSPECT', 'TRIAL', 'PAUSED', 'INACTIVE'],
  library_content_id UUID REFERENCES public."LibraryContent"(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."NurtureLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public."NurtureStep"(id) ON DELETE CASCADE,
  student_profile_id UUID REFERENCES public."StudentProfile"(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  conversion_details TEXT
);

-- Columnas de seguimiento en StudentProfile
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS nurture_step INTEGER DEFAULT 0;
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS nurture_last_sent_at TIMESTAMPTZ;
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS converted_from_step_id UUID REFERENCES public."NurtureStep"(id) ON DELETE SET NULL;

-- Habilitar RLS
ALTER TABLE public."NurtureStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."NurtureLog" ENABLE ROW LEVEL SECURITY;

-- Políticas para NurtureStep
DROP POLICY IF EXISTS "teacher_manages_own_nurture_steps" ON public."NurtureStep";
CREATE POLICY "teacher_manages_own_nurture_steps" ON public."NurtureStep"
  FOR ALL
  USING (
    teacher_id IN (
      SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid()
    )
  );

-- Políticas para NurtureLog
DROP POLICY IF EXISTS "teacher_manages_own_nurture_logs" ON public."NurtureLog";
CREATE POLICY "teacher_manages_own_nurture_logs" ON public."NurtureLog"
  FOR ALL
  USING (
    teacher_id IN (
      SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid()
    )
  );

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_nurture_step_teacher_order ON public."NurtureStep"(teacher_id, step_order);
CREATE INDEX IF NOT EXISTS idx_nurture_log_teacher_email ON public."NurtureLog"(teacher_id, email);

