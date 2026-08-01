-- =============================================================================
-- Migración 045: Recordatorios Push para el profesor 1 hora antes de sus clases
-- =============================================================================

-- 1. Añadir columna teacher_reminder_sent_at en la tabla Class
ALTER TABLE public."Class"
  ADD COLUMN IF NOT EXISTS teacher_reminder_sent_at TIMESTAMPTZ;

-- 2. Añadir preferencias de recordatorio en TeacherProfile
ALTER TABLE public."TeacherProfile"
  ADD COLUMN IF NOT EXISTS teacher_reminder_minutes INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS teacher_reminder_first_class_only BOOLEAN DEFAULT false;

-- 3. Crear índice para acelerar búsqueda de clases pendientes por notificar al profesor
CREATE INDEX IF NOT EXISTS idx_class_teacher_reminder ON public."Class"(teacher_id, date, teacher_reminder_sent_at);

-- 4. Programar cron job en pg_cron para ejecutarse cada 15 minutos
-- Reemplaza [TU-PROJECT-REF] y [TU-SERVICE-ROLE-KEY] en el dashboard de Supabase si aplica.
SELECT cron.schedule(
  'send_teacher_class_reminders_job',
  '*/15 * * * *',
  $$
    SELECT net.http_post(
        url:='https://ljazboprejtdrfsisfxu.supabase.co/functions/v1/send-teacher-class-reminders',
        headers:='{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ", "Content-Type": "application/json"}'::jsonb
    );
  $$
);
