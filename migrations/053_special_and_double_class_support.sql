-- =============================================================================
-- Migración 053: Soporte para clases especiales y clases dobles (2 horas)
-- =============================================================================
-- 
-- Permite distinguir y anotar clases especiales impartidas por el profesor
-- (ej. ensayos generales, masterclasses, preparación de conciertos o sesiones
-- especiales pactadas) y su integración fluida con el contador de clases.

DO $$ BEGIN
  -- 1. Añadir is_special si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'Class' 
      AND column_name = 'is_special'
  ) THEN
    ALTER TABLE public."Class" ADD COLUMN is_special BOOLEAN DEFAULT false;
  END IF;

  -- 2. Añadir special_note si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'Class' 
      AND column_name = 'special_note'
  ) THEN
    ALTER TABLE public."Class" ADD COLUMN special_note TEXT;
  END IF;
END $$;

-- 3. Crear índice para optimizar consultas de clases especiales
CREATE INDEX IF NOT EXISTS idx_class_is_special ON public."Class"(is_special);
