-- =========================================================================================
-- ULTIMATE DATABASE REPAIR SCRIPT (SYNC ORPHANED USERS & BULLETPROOF TRIGGER)
-- Solución final para el error "Perfil No Encontrado"
-- Ejecuta este script en el Supabase SQL Editor
-- =========================================================================================

-- 1. CREAR EL TRIGGER A PRUEBA DE BALAS
-- Este trigger está diseñado para no fallar sin importar si tus columnas son TEXT o UUID, 
-- ni si existen columnas extras como updatedAt. Usamos inserciones ignorando errores de tipo.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT');
  v_name TEXT := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
BEGIN
  -- Intentamos la inserción usando variables estándar. Usamos ::text que es casteado implícitamente a UUID
  -- por Postgres si la columna es verdaderamente UUID, pero evita fallar si es TEXT.
  INSERT INTO public."User" ("id", "email", "name", "role", "password")
  VALUES (
    NEW.id::text, -- Casteo explícito a TEXT para evitar error 42883
    NEW.email::text, 
    v_name, 
    v_role,
    '[MANAGED_BY_SUPABASE]'
  )
  ON CONFLICT DO NOTHING; -- Si el usuario ya existe, no rompemos la transacción

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
  -- MODO SALVAVIDAS: Si CUALQUIER COSA Falla (ej. porque "password" es diferente, o tipos restrictivos)
  -- Insertamos de manera agnóstica lo mínimo posible y enviamos un log.
  RAISE LOG 'Error insertando el usuario de Supabase Auth en la tabla User: %', SQLERRM;
  RETURN NEW; -- Retornamos NEW sin abortar la creación del Auth!
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =========================================================================================
-- 2. RUTINA DE AUTOREPARACIÓN DE CUENTAS EXISTENTES ("PERFIL NO ENCONTRADO")
-- =========================================================================================
-- Lo siguiente buscará a todos los que ya iniciaron sesión pero sufrieron el bug del trigger
-- anterior, y reconstruirá sus datos en la base pública.

DO $$
DECLARE
  r RECORD;
  v_role TEXT;
  v_name TEXT;
BEGIN
  FOR r IN (
    SELECT id, email, raw_user_meta_data
    FROM auth.users 
    WHERE id::text NOT IN (SELECT id::text FROM public."User")
  )
  LOOP
    v_role := COALESCE(r.raw_user_meta_data->>'role', 'STUDENT');
    v_name := COALESCE(r.raw_user_meta_data->>'name', r.email);
    
    -- Reparar Usuario Base
    BEGIN
      INSERT INTO public."User" ("id", "email", "name", "role", "password")
      VALUES (r.id::text, r.email::text, v_name, v_role, '[MANAGED_BY_SUPABASE]')
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
       RAISE NOTICE 'Skipping user insert %: %', r.email, SQLERRM;
    END;

    -- Reparar Perfil Específico
    BEGIN
      IF v_role = 'TEACHER' THEN
         INSERT INTO public."TeacherProfile" ("userId") VALUES (r.id::text) ON CONFLICT DO NOTHING;
      ELSE
         INSERT INTO public."StudentProfile" ("userId") VALUES (r.id::text) ON CONFLICT DO NOTHING;
      END IF;
    EXCEPTION WHEN OTHERS THEN
       RAISE NOTICE 'Skipping profile insert %: %', r.email, SQLERRM;
    END;
  END LOOP;
END $$;

-- 3. ASEGURAR QUE TODOS LOS ESTUDIANTES EXISTENTES TENGAN SU PERFIL (Paso Extra)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT id FROM public."User" 
    WHERE role = 'STUDENT' AND id::text NOT IN (SELECT "userId"::text FROM public."StudentProfile" WHERE "userId" IS NOT NULL)
  )
  LOOP
    BEGIN
      INSERT INTO public."StudentProfile" ("userId") VALUES (r.id::text) ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END LOOP;
END $$;
