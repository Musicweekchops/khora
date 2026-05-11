-- 0. Actualizar el trigger para capturar la región
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_region TEXT;
  v_teacher_id UUID;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'STUDENT');
  v_name := COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1));
  v_region := NEW.raw_user_meta_data ->> 'region';

  INSERT INTO public."User" (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role)
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'TEACHER' THEN
    INSERT INTO public."TeacherProfile" (user_id, region)
    VALUES (NEW.id, v_region)
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

-- 1. Añadir columnas necesarias
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public."TeacherProfile" ADD COLUMN IF NOT EXISTS region TEXT;

-- 2. Políticas RLS para Super Admin (Acceso Total)
-- User
CREATE POLICY "admin_all_users" ON public."User" FOR ALL USING (
  (SELECT is_admin FROM public."User" WHERE id = auth.uid()) = true
);

-- TeacherProfile
CREATE POLICY "admin_all_teachers" ON public."TeacherProfile" FOR ALL USING (
  (SELECT is_admin FROM public."User" WHERE id = auth.uid()) = true
);

-- StudentProfile
CREATE POLICY "admin_all_students" ON public."StudentProfile" FOR ALL USING (
  (SELECT is_admin FROM public."User" WHERE id = auth.uid()) = true
);

-- Payment
CREATE POLICY "admin_all_payments" ON public."Payment" FOR ALL USING (
  (SELECT is_admin FROM public."User" WHERE id = auth.uid()) = true
);

-- Class
CREATE POLICY "admin_all_classes" ON public."Class" FOR ALL USING (
  (SELECT is_admin FROM public."User" WHERE id = auth.uid()) = true
);

-- AutomationLog
CREATE POLICY "admin_all_logs" ON public."AutomationLog" FOR ALL USING (
  (SELECT is_admin FROM public."User" WHERE id = auth.uid()) = true
);

-- 3. Crear el usuario Super Admin (admin@khora.com / KhoraAdmin2026)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@khora.com') THEN
    
    -- Insertar en Autenticación de Supabase (el trigger se encargará de crear User y TeacherProfile)
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 'admin@khora.com', 
      crypt('KhoraAdmin2026', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"role": "TEACHER", "name": "Khora Admin", "region": "Administración"}', now(), now()
    );

    -- Actualizar el User creado por el trigger para darle permisos de Admin
    UPDATE public."User" SET is_admin = true WHERE email = 'admin@khora.com';

    -- Opcional: Actualizar el TeacherProfile para añadir el business_name
    UPDATE public."TeacherProfile" SET business_name = 'Khora Global' WHERE user_id = admin_id;
    
  ELSE
    -- Si ya existe, asegurar que tenga poderes de admin
    UPDATE public."User" SET is_admin = true WHERE email = 'admin@khora.com';
  END IF;
END $$;
