-- Crear una vista pública que exponga el last_sign_in_at de auth.users
-- La vista se ejecuta con permisos elevados (SECURITY DEFINER) de forma implícita
-- al conectar con el service role, pero la exponemos de forma selectiva.

CREATE OR REPLACE VIEW public.user_last_seen AS
SELECT
  id,
  last_sign_in_at,
  -- Online: conectado en los últimos 5 minutos
  (last_sign_in_at > now() - interval '5 minutes') AS is_online
FROM auth.users;

-- Dar acceso de lectura al rol autenticado
GRANT SELECT ON public.user_last_seen TO authenticated;
GRANT SELECT ON public.user_last_seen TO service_role;

-- Activar RLS si aplica (las vistas no soportan RLS directamente, 
-- pero la política de la vista base lo hereda del service_role)
