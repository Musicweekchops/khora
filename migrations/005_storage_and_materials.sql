-- 1. Crear o actualizar el bucket de materiales a PUBLICO
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Limpiar políticas existentes para evitar errores de duplicidad
DROP POLICY IF EXISTS "Public Read for Authenticated Users" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete their own materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update materials" ON storage.objects;

-- 3. Crear las políticas de seguridad para el Bucket 'materials'

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

-- Permiso de ELIMINACIÓN: Solo Profesores
CREATE POLICY "Teachers can delete their own materials" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'materials' AND 
  (SELECT role FROM public."User" WHERE id = auth.uid()) = 'TEACHER'
);

-- Permiso de ACTUALIZACIÓN
CREATE POLICY "Teachers can update materials" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'materials' AND 
  (SELECT role FROM public."User" WHERE id = auth.uid()) = 'TEACHER'
);
