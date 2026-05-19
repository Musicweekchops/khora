-- Migration: Add 'instrumento' column to TeacherProfile
ALTER TABLE public."TeacherProfile" ADD COLUMN IF NOT EXISTS instrumento TEXT;

-- Enable public read permissions in case profiles are read publicly
DROP POLICY IF EXISTS "tp_public_read" ON public."TeacherProfile";
CREATE POLICY "tp_public_read" ON public."TeacherProfile" FOR SELECT USING (true);

-- Update trigger function to automatically populate 'instrumento' from raw_user_meta_data on register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_teacher_id UUID;
  v_instrumento TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'STUDENT');
  v_name := COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1));
  v_instrumento := NEW.raw_user_meta_data ->> 'instrumento';

  INSERT INTO public."User" (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role)
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'TEACHER' THEN
    INSERT INTO public."TeacherProfile" (user_id, instrumento)
    VALUES (NEW.id, v_instrumento)
    ON CONFLICT (user_id) DO UPDATE SET instrumento = EXCLUDED.instrumento;
  ELSIF v_role = 'STUDENT' THEN
    -- Intentar obtener teacher_id de metadata
    v_teacher_id := (NEW.raw_user_meta_data ->> 'teacher_id')::UUID;
    
    -- AUTOMATIZACIÓN: Si no hay teacher_id (creación manual), asignar el primer profesor disponible
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
