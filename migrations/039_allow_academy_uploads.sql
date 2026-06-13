-- Migration 039: Allow ACADEMY role to upload, update, and delete materials in the storage bucket

-- 1. Drop existing storage policies for 'materials' bucket
DROP POLICY IF EXISTS "Teachers can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete their own materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and Academies can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and Academies can delete materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and Academies can update materials" ON storage.objects;

-- 2. Create updated storage policies that allow both TEACHER and ACADEMY roles

-- Permiso de SUBIDA (Insert)
CREATE POLICY "Teachers and Academies can upload materials" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'materials' AND 
  (SELECT role FROM public."User" WHERE id = auth.uid()) IN ('TEACHER', 'ACADEMY')
);

-- Permiso de ELIMINACIÓN (Delete)
CREATE POLICY "Teachers and Academies can delete materials" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'materials' AND 
  (SELECT role FROM public."User" WHERE id = auth.uid()) IN ('TEACHER', 'ACADEMY')
);

-- Permiso de ACTUALIZACIÓN (Update)
CREATE POLICY "Teachers and Academies can update materials" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'materials' AND 
  (SELECT role FROM public."User" WHERE id = auth.uid()) IN ('TEACHER', 'ACADEMY')
);
