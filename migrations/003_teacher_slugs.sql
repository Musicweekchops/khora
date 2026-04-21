-- Habilitar extensión para quitar acentos
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Agregar columna slug a TeacherProfile
ALTER TABLE public."TeacherProfile" 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Crear un índice para búsquedas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_teacher_profile_slug ON public."TeacherProfile"(slug);

-- Función para generar un slug a partir de un texto (ej: nombre)
CREATE OR REPLACE FUNCTION public.slugify(value TEXT)
RETURNS TEXT AS $$
  -- Convertir a minúsculas, reemplazar caracteres especiales y espacios por guiones
  SELECT regexp_replace(
    regexp_replace(
      lower(unaccent(value)),
      '[^a-z0-9\\-_]+', '-', 'gi'
    ),
    '^-+|-+$', '', 'g'
  );
$$ LANGUAGE SQL IMMUTABLE STRICT;

-- Actualizar registros existentes con un slug basado en el nombre del usuario
-- Asumiendo que User.name existe y está vinculado por User.id = TeacherProfile.user_id
UPDATE public."TeacherProfile" tp
SET slug = sub.generated_slug
FROM (
  SELECT u.id, public.slugify(u.name) || '-' || substr(u.id::text, 1, 4) as generated_slug
  FROM public."User" u
) sub
WHERE tp.user_id = sub.id AND tp.slug IS NULL;
