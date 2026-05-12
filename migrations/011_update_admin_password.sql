-- Activar la extensión pgcrypto si no está activa
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Actualizar la contraseña del administrador a 'mwc24millones'
UPDATE auth.users 
SET encrypted_password = crypt('mwc24millones', gen_salt('bf')) 
WHERE email = 'admin@khora.com';
