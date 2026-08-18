-- =============================================================================
-- MIGRACIÓN PARA COMPROBANTES DE PAGO Y STORAGE BUCKET EN KHORA
-- =============================================================================

-- 1. Agregar columnas para comprobante a la tabla Payment (si no existen)
ALTER TABLE public."Payment" 
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS transfer_id TEXT;

-- 2. Crear el Bucket de Storage public 'payment-receipts' (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Políticas de acceso para el bucket 'payment-receipts'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Permitir ver comprobantes a todos' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Permitir ver comprobantes a todos" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'payment-receipts');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Permitir subir comprobantes a usuarios autenticados' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Permitir subir comprobantes a usuarios autenticados" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'payment-receipts');
  END IF;
END $$;
