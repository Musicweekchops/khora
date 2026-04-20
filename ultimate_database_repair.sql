-- =========================================================================================
-- ULTIMATE DATABASE REPAIR SCRIPT (SYNC ORPHANED USERS & BULLETPROOF TRIGGER)
-- Solución final para el error "Perfil No Encontrado" (Errores 406 / PGRST116)
-- Ejecuta este script en el Supabase SQL Editor
-- =========================================================================================

-- 1. CREAR EL TRIGGER A PRUEBA DE BALAS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT');
  v_name TEXT := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
BEGIN
  -- Cast explícito a ::text para evitar error de operador 42883
  INSERT INTO public."User" ("id", "email", "name", "role", "password")
  VALUES (
    NEW.id::text, 
    NEW.email::text, 
    v_name, 
    v_role,
    '[MANAGED_BY_SUPABASE]'
  )
  ON CONFLICT DO NOTHING;

  -- 2. Crear los perfiles vinculados
  IF v_role = 'TEACHER' THEN
    INSERT INTO public."TeacherProfile" ("userId") 
    VALUES (NEW.id::text)
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public."StudentProfile" ("userId") 
    VALUES (NEW.id::text)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error insertando el usuario de Supabase Auth en la tabla User: %', SQLERRM;
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =========================================================================================
-- 2. RUTINA DE AUTOREPARACIÓN DE CUENTAS EXISTENTES ("PERFIL NO ENCONTRADO")
-- =========================================================================================

DO $$
DECLARE
  r RECORD;
  v_role TEXT;
  v_name TEXT;
BEGIN
  FOR r IN (
    SELECT id, email, raw_user_meta_data
    FROM auth.users a
    -- Uso de NOT EXISTS para evitar errores críticos si hay IDs nulos y para evadir el error 42883
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

-- 3. ASEGURAR QUE TODOS LOS ESTUDIANTES EXISTENTES TENGAN SU PERFIL
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT id FROM public."User" u
    WHERE role = 'STUDENT' AND NOT EXISTS (
       SELECT 1 FROM public."StudentProfile" sp WHERE sp."userId"::text = u.id::text
    )
  )
  LOOP
    BEGIN
      INSERT INTO public."StudentProfile" ("userId") VALUES (r.id::text) ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END LOOP;
END $$;
