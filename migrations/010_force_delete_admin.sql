-- Script para forzar la eliminación del usuario corrupto
-- 1. Borrar primero las dependencias manualmente en cascada
DELETE FROM public."User" WHERE email = 'admin@khora.com';

-- 2. Borrar el usuario de autenticación
DELETE FROM auth.users WHERE email = 'admin@khora.com';
