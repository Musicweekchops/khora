-- =============================================================================
-- Migración 057: Corregir columnas faltantes en ExerciseSubmission
-- Asegura created_by y teacher_feedback_video_url para permitir feedback y videos del profesor
-- =============================================================================

ALTER TABLE public."ExerciseSubmission"
  ADD COLUMN IF NOT EXISTS created_by TEXT NOT NULL DEFAULT 'STUDENT' CHECK (created_by IN ('STUDENT', 'TEACHER')),
  ADD COLUMN IF NOT EXISTS teacher_feedback_video_url TEXT;

-- Actualizar filas existentes para asegurar que created_by sea 'STUDENT'
UPDATE public."ExerciseSubmission"
  SET created_by = 'STUDENT'
  WHERE created_by IS NULL;

-- Recuperar el video grabado por Arnaldo para Gloria si aún no está registrado
INSERT INTO public."ExerciseSubmission" (
  student_id,
  teacher_id,
  title,
  video_url,
  created_by,
  status,
  created_at,
  updated_at
)
SELECT
  '70291ca5-bbaa-4281-b648-dc2d5380dde5'::UUID,
  'c11c7098-758d-45e2-84cf-f6552af6c5db'::UUID,
  'Demostración de ejercicio para Gloria Cespedes',
  'https://ljazboprejtdrfsisfxu.supabase.co/storage/v1/object/public/submissions/70291ca5-bbaa-4281-b648-dc2d5380dde5/1794524641793_mf1rg.mp4',
  'TEACHER',
  'APPROVED',
  '2026-11-12 23:04:19.397051+00'::TIMESTAMPTZ,
  '2026-11-12 23:04:19.397051+00'::TIMESTAMPTZ
WHERE NOT EXISTS (
  SELECT 1 FROM public."ExerciseSubmission" 
  WHERE video_url = 'https://ljazboprejtdrfsisfxu.supabase.co/storage/v1/object/public/submissions/70291ca5-bbaa-4281-b648-dc2d5380dde5/1794524641793_mf1rg.mp4'
);
