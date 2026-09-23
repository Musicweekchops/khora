-- =============================================================================
-- Migración 048: Añadir columna title a la tabla Class para compromisos y reuniones
-- =============================================================================

ALTER TABLE public."Class"
  ADD COLUMN IF NOT EXISTS title TEXT;
