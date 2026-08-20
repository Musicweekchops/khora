-- Migration 047: Asegurar bucket 'materials' y políticas RLS para subida y visualización de recursos de biblioteca

-- 1. Crear o actualizar el bucket de materiales a PÚBLICO
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Limpiar políticas previas en storage.objects para evitar duplicados
DROP POLICY IF EXISTS "Public Read for Authenticated Users" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete their own materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and Academies can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and Academies can delete materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and Academies can update materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete materials" ON storage.objects;

-- 3. Crear políticas RLS universales para el bucket 'materials'

-- Permiso de LECTURA: Público y Autenticados
CREATE POLICY "Public Read Materials" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'materials');

-- Permiso de SUBIDA (Insert): Usuarios autenticados (Profesores, Academias, Admins)
CREATE POLICY "Authenticated users upload materials" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'materials');

-- Permiso de ACTUALIZACIÓN (Update): Usuarios autenticados
CREATE POLICY "Authenticated users update materials" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'materials');

-- Permiso de ELIMINACIÓN (Delete): Usuarios autenticados
CREATE POLICY "Authenticated users delete materials" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'materials');

NOTIFY pgrst, 'reload schema';
