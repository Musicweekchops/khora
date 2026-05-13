-- ================================================================
-- MIGRACIÓN 015: Sincronizar last_sign_in_at de auth → public.User
-- El rol 'authenticated' NO puede leer auth.users directamente.
-- La solución es copiar el dato via trigger SECURITY DEFINER.
-- ================================================================

-- 1. Añadir la columna a la tabla pública
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- 2. Función que copia el timestamp al hacer login (se ejecuta como superuser)
CREATE OR REPLACE FUNCTION public.sync_last_sign_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."User"
  SET last_sign_in_at = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- 3. Trigger que se dispara cuando Supabase actualiza last_sign_in_at en auth.users
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
  EXECUTE FUNCTION public.sync_last_sign_in();

-- 4. Backfill: copiar el valor actual para los usuarios ya existentes
UPDATE public."User" u
SET last_sign_in_at = a.last_sign_in_at
FROM auth.users a
WHERE a.id = u.id;