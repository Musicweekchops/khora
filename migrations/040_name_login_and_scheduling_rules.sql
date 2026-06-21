-- Migration 040: Add get_email_by_name RPC for student login and enable unaccent
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.get_email_by_name(p_name TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Busca un usuario cuyo nombre coincida de forma insensible a mayúsculas, minúsculas y acentos
  SELECT email INTO v_email
  FROM public."User"
  WHERE lower(public.unaccent(name)) = lower(public.unaccent(p_name))
  LIMIT 1;
  
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
