-- 1. Crear el bucket de materiales (si no existe)
-- Nota: Esto requiere privilegios de administrador en el dashboard de Supabase, 
-- pero se incluye el SQL para las políticas.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Seguridad para el Bucket 'materials'

-- Permiso de LECTURA: Profesores y Alumnos autenticados
CREATE POLICY "Public Read for Authenticated Users" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'materials');

-- Permiso de SUBIDA: Solo Profesores
CREATE POLICY "Teachers can upload materials" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'materials' AND 
  (SELECT role FROM public."User" WHERE id = auth.uid()) = 'TEACHER'
);

-- Permiso de ELIMINACIÓN: Solo el dueño del archivo (profesor)
CREATE POLICY "Teachers can delete their own materials" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'materials' AND 
  (SELECT role FROM public."User" WHERE id = auth.uid()) = 'TEACHER'
);

-- Permiso de ACTUALIZACIÓN (opcional)
CREATE POLICY "Teachers can update materials" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'materials' AND 
  (SELECT role FROM public."User" WHERE id = auth.uid()) = 'TEACHER'
);
