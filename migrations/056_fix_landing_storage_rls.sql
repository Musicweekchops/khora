-- =============================================================================
-- Migración 056: Corrección definitiva de Políticas RLS para subida de assets
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('landing', 'landing', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Admins can manage landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and admins can manage landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to landing bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow update to landing bucket" ON storage.objects;

-- Permiso de LECTURA: Público
DROP POLICY IF EXISTS "Public Read for landing assets" ON storage.objects;
CREATE POLICY "Public Read for landing assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing');

-- Permiso de SUBIDA (Insert): Público y Autenticado
CREATE POLICY "Allow upload to landing bucket" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'landing');

-- Permiso de ACTUALIZACIÓN (Update): Público y Autenticado
CREATE POLICY "Allow update to landing bucket" 
ON storage.objects FOR UPDATE 
TO public 
USING (bucket_id = 'landing');

-- Permiso de SUBIDA/ACTUALIZACIÓN en 'materials'
DROP POLICY IF EXISTS "Authenticated users upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload materials bucket" ON storage.objects;
CREATE POLICY "Allow upload materials bucket" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'materials');

DROP POLICY IF EXISTS "Authenticated users update materials" ON storage.objects;
DROP POLICY IF EXISTS "Allow update materials bucket" ON storage.objects;
CREATE POLICY "Allow update materials bucket" 
ON storage.objects FOR UPDATE 
TO public 
USING (bucket_id = 'materials');

NOTIFY pgrst, 'reload schema';
