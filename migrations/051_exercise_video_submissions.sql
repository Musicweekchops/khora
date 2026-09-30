-- Migration 051: Sistema de Entregas de Video de Ejercicios y Feedback Técnico
-- Permite a los alumnos grabar o subir videos de sus prácticas (con audio optimizado y 720p)
-- y a los profesores revisarlos con slow motion, notas por timestamp y feedback.

-- 1. Crear el bucket de almacenamiento para videos de práctica
INSERT INTO storage.buckets (id, name, public) 
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas para storage.objects en el bucket 'submissions'
DROP POLICY IF EXISTS "Public Read Submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete submissions" ON storage.objects;

CREATE POLICY "Public Read Submissions" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'submissions');

CREATE POLICY "Authenticated users upload submissions" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'submissions');

CREATE POLICY "Authenticated users update submissions" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'submissions');

CREATE POLICY "Authenticated users delete submissions" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'submissions');

-- 2. Crear tabla ExerciseSubmission
CREATE TABLE IF NOT EXISTS public."ExerciseSubmission" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public."Task"(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL DEFAULT 'Práctica de ejercicio',
  video_url TEXT NOT NULL,
  video_duration INTEGER,
  student_notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'STUDENT' CHECK (created_by IN ('STUDENT', 'TEACHER')),
  
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'NEEDS_WORK')),
  teacher_feedback_text TEXT,
  teacher_feedback_audio_url TEXT,
  teacher_feedback_video_url TEXT,
  timestamp_markers JSONB DEFAULT '[]'::jsonb,
  
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_submissions_teacher ON public."ExerciseSubmission"(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public."ExerciseSubmission"(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON public."ExerciseSubmission"(task_id);

-- 4. Habilitar RLS
ALTER TABLE public."ExerciseSubmission" ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes si las hubiera
DROP POLICY IF EXISTS "admin_all_submissions" ON public."ExerciseSubmission";
DROP POLICY IF EXISTS "teacher_manage_submissions" ON public."ExerciseSubmission";
DROP POLICY IF EXISTS "student_read_submissions" ON public."ExerciseSubmission";
DROP POLICY IF EXISTS "student_insert_submissions" ON public."ExerciseSubmission";
DROP POLICY IF EXISTS "student_update_submissions" ON public."ExerciseSubmission";

-- Política para Administradores
CREATE POLICY "admin_all_submissions" ON public."ExerciseSubmission"
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."User" WHERE id = auth.uid() AND is_admin = true)
  );

-- Política para Profesores (pueden ver y actualizar entregas de sus alumnos)
CREATE POLICY "teacher_manage_submissions" ON public."ExerciseSubmission"
  FOR ALL TO authenticated
  USING (
    teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
  )
  WITH CHECK (
    teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
  );

-- Política para Alumnos (pueden ver y registrar sus entregas)
CREATE POLICY "student_read_submissions" ON public."ExerciseSubmission"
  FOR SELECT TO authenticated
  USING (
    student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
  );

CREATE POLICY "student_insert_submissions" ON public."ExerciseSubmission"
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
  );

CREATE POLICY "student_update_submissions" ON public."ExerciseSubmission"
  FOR UPDATE TO authenticated
  USING (
    student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
  );

NOTIFY pgrst, 'reload schema';
