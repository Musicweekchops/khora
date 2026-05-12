-- Habilitar pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
BEGIN
  -- 1. Limpieza profunda
  DELETE FROM public."User" WHERE email = 'admin@khora.com';
  DELETE FROM auth.users WHERE email = 'admin@khora.com';

  -- 2. Insertar Usuario en auth.users con correo ya confirmado
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_admin_id, 'authenticated', 'authenticated', 'admin@khora.com', 
    crypt('mwc24millones', gen_salt('bf')), now(), -- now() valida el correo automáticamente
    '{"provider":"email","providers":["email"]}', '{"role": "TEACHER", "name": "Khora Admin", "region": "Global"}', now(), now(),
    '', '', '', ''
  );

  -- 3. Insertar Identidad obligatoria con TODAS las columnas requeridas
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_admin_id, v_admin_id::text, format('{"sub":"%s","email":"%s"}', v_admin_id::text, 'admin@khora.com')::jsonb, 'email', now(), now(), now()
  );

  -- 4. Darle poderes de Super Admin al perfil que creó el trigger
  UPDATE public."User" SET is_admin = true WHERE email = 'admin@khora.com';
  UPDATE public."TeacherProfile" SET business_name = 'Khora Global' WHERE user_id = v_admin_id;

END $$;
