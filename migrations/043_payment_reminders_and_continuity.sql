-- =============================================================================
-- Migración 043: Modificaciones para el sistema de continuidad y cobranza automatizada
-- =============================================================================

-- 1. Asegurar que por defecto la cobranza automatizada esté DESACTIVADA para todo alumno nuevo
ALTER TABLE public."StudentProfile" 
  ALTER COLUMN collection_active SET DEFAULT false;

-- 2. Añadir columnas de seguimiento de continuidad y cadencia de correos en StudentProfile
ALTER TABLE public."StudentProfile"
  ADD COLUMN IF NOT EXISTS continuity_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS continuity_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS continuity_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_reminder_sent_at TIMESTAMPTZ;

-- 3. Añadir clasificación para clases pendientes por recuperar en la tabla Class
ALTER TABLE public."Class"
  ADD COLUMN IF NOT EXISTS is_recovery_pending BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recovery_reason TEXT;

-- 4. Crear índice para acelerar consultas de clases por recuperar
CREATE INDEX IF NOT EXISTS idx_class_student_recovery ON public."Class"(student_id, is_recovery_pending);
