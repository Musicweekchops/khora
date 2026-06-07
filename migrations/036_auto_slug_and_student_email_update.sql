-- Habilitar extensión unaccent si no está
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Asegurar columna slug en TeacherProfile (por si acaso)
ALTER TABLE public."TeacherProfile" 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_teacher_profile_slug ON public."TeacherProfile"(slug);

-- Asegurar función slugify
CREATE OR REPLACE FUNCTION public.slugify(value TEXT)
RETURNS TEXT AS $$
  SELECT regexp_replace(
    regexp_replace(
      lower(unaccent(value)),
      '[^a-z0-9\-_]+', '-', 'gi'
    ),
    '^-+|-+$', '', 'g'
  );
$$ LANGUAGE SQL IMMUTABLE STRICT;

-- Actualizar handle_new_user trigger para auto-generar slug
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_teacher_id UUID;
  v_slug TEXT;
  v_counter INTEGER := 1;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'STUDENT');
  v_name := COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1));

  INSERT INTO public."User" (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role)
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'TEACHER' THEN
    -- Auto-generar slug único basado en el nombre
    v_slug := public.slugify(v_name);
    
    -- Manejo de colisión de slugs
    WHILE EXISTS (SELECT 1 FROM public."TeacherProfile" WHERE slug = v_slug) LOOP
      v_slug := public.slugify(v_name) || '-' || v_counter;
      v_counter := v_counter + 1;
    END LOOP;

    INSERT INTO public."TeacherProfile" (user_id, slug)
    VALUES (NEW.id, v_slug)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_role = 'STUDENT' THEN
    v_teacher_id := (NEW.raw_user_meta_data ->> 'teacher_id')::UUID;
    
    IF v_teacher_id IS NULL THEN
      SELECT id INTO v_teacher_id FROM public."TeacherProfile" ORDER BY created_at ASC LIMIT 1;
    END IF;

    IF v_teacher_id IS NOT NULL THEN
      INSERT INTO public."StudentProfile" (user_id, teacher_id)
      VALUES (NEW.id, v_teacher_id)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para actualizar email de estudiante por parte de su profesor
CREATE OR REPLACE FUNCTION public.update_student_email(
  p_user_id UUID,
  p_new_email TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_teacher_id UUID;
  v_student_teacher_id UUID;
BEGIN
  -- 1. Validar que el que llama sea profesor
  IF NOT public.is_teacher() THEN
    RAISE EXCEPTION 'Solo los profesores pueden actualizar emails de estudiantes.';
  END IF;

  -- 2. Obtener el teacher_id del que llama
  SELECT id INTO v_teacher_id 
  FROM public."TeacherProfile" 
  WHERE user_id = auth.uid();

  -- 3. Obtener el teacher_id del estudiante
  SELECT teacher_id INTO v_student_teacher_id
  FROM public."StudentProfile"
  WHERE user_id = p_user_id;

  IF v_teacher_id IS NULL OR v_student_teacher_id IS NULL OR v_teacher_id <> v_student_teacher_id THEN
    RAISE EXCEPTION 'No tienes permiso para actualizar este estudiante.';
  END IF;

  -- 4. Validar que el email no esté registrado por otro usuario
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_new_email AND id <> p_user_id) THEN
    RAISE EXCEPTION 'El email % ya está registrado por otro usuario.', p_new_email;
  END IF;

  -- 5. Actualizar en auth.users
  UPDATE auth.users 
  SET email = p_new_email,
      email_confirmed_at = now(),
      updated_at = now()
  WHERE id = p_user_id;

  -- 6. Actualizar en public.User
  UPDATE public."User"
  SET email = p_new_email
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
