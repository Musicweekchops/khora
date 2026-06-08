-- =============================================================================
-- MIGRACIÓN 036: Fix del trigger handle_new_user
-- Problema: El trigger fallaba silenciosamente en todos los nuevos registros
-- porque la función no incluía los campos nuevos (instrumento, region) y
-- el EXCEPTION WHEN OTHERS ocultaba el error sin crear los registros.
-- =============================================================================

-- Reescribir el trigger incluyendo todos los campos actuales del schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role       TEXT;
  v_name       TEXT;
  v_instrumento TEXT;
  v_region     TEXT;
  v_teacher_id UUID;
  v_slug       TEXT;
  v_counter    INTEGER := 1;
BEGIN
  -- Extraer datos del metadata del usuario registrado
  v_role        := COALESCE(NEW.raw_user_meta_data ->> 'role', 'STUDENT');
  v_name        := COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1));
  v_instrumento := NEW.raw_user_meta_data ->> 'instrumento';
  v_region      := NEW.raw_user_meta_data ->> 'region';

  -- 1. Crear registro en public.User
  INSERT INTO public."User" (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role)
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'TEACHER' THEN
    -- 2a. Generar slug único basado en el nombre
    v_slug := public.slugify(v_name);

    -- Resolver colisiones de slug
    WHILE EXISTS (SELECT 1 FROM public."TeacherProfile" WHERE slug = v_slug) LOOP
      v_slug    := public.slugify(v_name) || '-' || v_counter;
      v_counter := v_counter + 1;
    END LOOP;

    -- 2b. Crear TeacherProfile con todos los campos disponibles
    INSERT INTO public."TeacherProfile" (user_id, slug, instrumento, region)
    VALUES (NEW.id, v_slug, v_instrumento, v_region)
    ON CONFLICT (user_id) DO UPDATE
      SET instrumento = COALESCE(EXCLUDED.instrumento, public."TeacherProfile".instrumento),
          region      = COALESCE(EXCLUDED.region, public."TeacherProfile".region),
          slug        = COALESCE(public."TeacherProfile".slug, EXCLUDED.slug);

  ELSIF v_role = 'STUDENT' THEN
    -- 3. Obtener teacher_id del metadata (o el primer profesor disponible)
    v_teacher_id := (NEW.raw_user_meta_data ->> 'teacher_id')::UUID;

    IF v_teacher_id IS NULL THEN
      SELECT id INTO v_teacher_id
      FROM public."TeacherProfile"
      ORDER BY created_at ASC
      LIMIT 1;
    END IF;

    IF v_teacher_id IS NOT NULL THEN
      INSERT INTO public."StudentProfile" (user_id, teacher_id)
      VALUES (NEW.id, v_teacher_id)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Loguear el error pero no bloquear el registro de auth
  RAISE LOG 'handle_new_user ERROR para % (id=%): %', NEW.email, NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- BACKFILL: Rellenar region e instrumento para profesores existentes
-- que se registraron antes de esta migración y tienen campos null.
-- Estos datos ya estaban guardados en auth.users (raw_user_meta_data)
-- pero el trigger antiguo no los copiaba al TeacherProfile.
-- NOTA: Este backfill fue ejecutado via script Node.js (scratch/backfill_region.ts)
-- el 2026-06-08. Se deja documentado aquí para trazabilidad.
-- Afectó: contacto@ritmatica.cl, hvaldesmedrano@gmail.com,
--         mauplguitar@gmail.com, benjaminzunigasolis.trabajos@gmail.com
-- =============================================================================
