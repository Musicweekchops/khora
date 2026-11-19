-- =============================================================================
-- Migración 059: Correos Programados en Fecha y Hora Específica en el Funnel
-- (No modifican nurture_step ni nurture_last_sent_at de los alumnos)
-- =============================================================================

ALTER TABLE public."NurtureStep"
  ADD COLUMN IF NOT EXISTS step_type TEXT NOT NULL DEFAULT 'SEQUENCE' CHECK (step_type IN ('SEQUENCE', 'SCHEDULED')),
  ADD COLUMN IF NOT EXISTS scheduled_date DATE,
  ADD COLUMN IF NOT EXISTS scheduled_time TEXT DEFAULT '18:00',
  ADD COLUMN IF NOT EXISTS broadcast_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_nurture_step_scheduled
  ON public."NurtureStep"(teacher_id, step_type, scheduled_date, broadcast_sent_at);
