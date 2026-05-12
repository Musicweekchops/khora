-- Añadir columna para controlar los recordatorios de cobranza
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS collection_active BOOLEAN DEFAULT true;
