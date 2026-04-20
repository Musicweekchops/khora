-- =========================================================================================
-- FIX GHOST COLLISION (CORRECCIÓN DEFINITIVA DE CORREOS ATASCADOS)
-- =========================================================================================

-- EXPLICACIÓN DEL PROBLEMA:
-- Cuando la pantalla de la app te dijo "ve a Supabase y borra tu correo", tú lo hiciste.
-- Borraste al usuario de la tabla del sistema (auth.users), ¡PERO tu tabla pública ("public.User") 
-- se quedó con una copia fantasma de ese correo!
-- Al re-registrarte, Supabase Auth te dio un NUEVO ID de usuario, y cuando el trigger
-- intentó guardar tu nuevo ID con el mismo correo, la base de datos rebotó la operación 
-- porque la tabla "User" tiene una regla de que "el correo no se puede repetir" (UNIQUE).
-- Por ende: Tienes sesión iniciada, pero la base de datos nunca te guardó.

-- 1. LIMPIEZA DE FANTASMAS
-- Borramos de la tabla pública a todo aquel que ya NO exista verdaderamente en auth.users
-- (Esto liberará los correos atrapados)
DELETE FROM public."StudentProfile"
WHERE "userId"::text IN (
    SELECT id::text FROM public."User" WHERE id::text NOT IN (SELECT id::text FROM auth.users)
);

DELETE FROM public."TeacherProfile"
WHERE "userId"::text IN (
    SELECT id::text FROM public."User" WHERE id::text NOT IN (SELECT id::text FROM auth.users)
);

DELETE FROM public."User" 
WHERE id::text NOT IN (SELECT id::text FROM auth.users);

-- 2. RE-SINCRONIZAR A LOS QUE ESTABAN BLOQUEADOS
-- Ahora que el correo está libre, guardamos al fin tu nuevo usuario a la base de datos.
DO $$
DECLARE
  r RECORD;
  v_role TEXT;
  v_name TEXT;
BEGIN
  FOR r IN (
    SELECT id, email, raw_user_meta_data
    FROM auth.users a
    WHERE NOT EXISTS (
       SELECT 1 FROM public."User" u WHERE u.id::text = a.id::text
    )
  )
  LOOP
    v_role := COALESCE(r.raw_user_meta_data->>'role', 'STUDENT');
    v_name := COALESCE(r.raw_user_meta_data->>'name', r.email);
    
    BEGIN
      INSERT INTO public."User" ("id", "email", "name", "role", "password")
      VALUES (r.id::text, r.email::text, v_name, v_role, '[MANAGED_BY_SUPABASE]')
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
      IF v_role = 'TEACHER' THEN
         INSERT INTO public."TeacherProfile" ("userId") VALUES (r.id::text) ON CONFLICT DO NOTHING;
      ELSE
         INSERT INTO public."StudentProfile" ("userId") VALUES (r.id::text) ON CONFLICT DO NOTHING;
      END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END LOOP;
END $$;

-- 3. AÑADIR GATILLO PARA QUE ESTO NO VUELVA A PASAR NUNCA
-- Si borras a alguien desde "Authentication", se borrará de "User" automáticamente.
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public."User" WHERE id::text = OLD.id::text;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_deleted_user();
