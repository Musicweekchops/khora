-- =============================================================================
-- Migración 056: Corrección de Políticas RLS para subida de assets en bucket 'landing'
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('landing', 'landing', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Admins can manage landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and admins can manage landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete landing assets" ON storage.objects;

-- Permiso de LECTURA: Público
DROP POLICY IF EXISTS "Public Read for landing assets" ON storage.objects;
CREATE POLICY "Public Read for landing assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing');

-- Permiso de SUBIDA (Insert): Usuarios autenticados
CREATE POLICY "Authenticated users upload landing assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'landing');

-- Permiso de ACTUALIZACIÓN (Update): Usuarios autenticados
CREATE POLICY "Authenticated users update landing assets" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'landing');

-- Permiso de ELIMINACIÓN (Delete): Usuarios autenticados
CREATE POLICY "Authenticated users delete landing assets" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'landing');

NOTIFY pgrst, 'reload schema';

