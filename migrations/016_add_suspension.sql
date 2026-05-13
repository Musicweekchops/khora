-- Suspender/reactivar cuentas de profesores sin borrar datos
ALTER TABLE public."TeacherProfile" ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
