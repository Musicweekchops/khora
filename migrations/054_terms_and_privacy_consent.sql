-- =============================================================================
-- Migración 054: Registro de Consentimiento de Términos, Privacidad y Comunicaciones
-- =============================================================================

DO $$ BEGIN
  -- 1. Añadir columnas a tabla User
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'User' 
      AND column_name = 'terms_accepted_at'
  ) THEN
    ALTER TABLE public."User" ADD COLUMN terms_accepted_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'User' 
      AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE public."User" ADD COLUMN marketing_consent BOOLEAN DEFAULT true;
  END IF;

  -- 2. Añadir columnas a tabla Booking (para reservas de alumnos no registrados aún)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'Booking' 
      AND column_name = 'terms_accepted_at'
  ) THEN
    ALTER TABLE public."Booking" ADD COLUMN terms_accepted_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'Booking' 
      AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE public."Booking" ADD COLUMN marketing_consent BOOLEAN DEFAULT true;
  END IF;
END $$;

