-- =============================================================================
-- MIGRACIÓN 050: Auto-Deploy Webhook para Render
-- Dispara un rebuild automático en Render cuando un profesor se registra
-- o cambia su enlace (slug).
-- =============================================================================

-- 1. Habilitar la extensión de red de Supabase (si no está habilitada)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Crear la función que envía la señal a Render
CREATE OR REPLACE FUNCTION public.trigger_render_deploy()
RETURNS TRIGGER AS $$
BEGIN
  -- ¡IMPORTANTE! Reemplaza la URL de abajo con tu verdadero Deploy Hook de Render
  PERFORM net.http_post(
    url := 'https://api.render.com/deploy/srv-AQUIPON-TU-CODIGO-DE-RENDER',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el "gatillo" (trigger) en la tabla TeacherProfile
DROP TRIGGER IF EXISTS on_teacher_profile_change_deploy ON public."TeacherProfile";

CREATE TRIGGER on_teacher_profile_change_deploy
  AFTER INSERT OR UPDATE OF slug
  ON public."TeacherProfile"
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_render_deploy();
