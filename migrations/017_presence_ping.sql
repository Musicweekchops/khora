-- Crear una función segura para que los clientes actualicen su "last seen" sin lidiar con RLS
CREATE OR REPLACE FUNCTION public.ping_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos de DB owner
AS $$
BEGIN
  -- Solo hace update si el usuario está autenticado
  IF auth.uid() IS NOT NULL THEN
    UPDATE public."User"
    SET last_sign_in_at = NOW()
    WHERE id = auth.uid();
  END IF;
END;
$$;
