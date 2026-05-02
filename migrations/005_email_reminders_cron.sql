-- =============================================================================
-- Migración: Programar envío de correos automatizados
-- =============================================================================

-- 1. Habilitar extensiones necesarias (pg_net para HTTP requests, pg_cron para programar)
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. (Comentado en la primera ejecución para evitar error) Eliminar el job si ya existe
-- SELECT cron.unschedule('email_reminders_job');

-- 3. Crear el job programado
-- El cron expression '0 * * * *' significa cada hora en punto (minuto 0)
-- ATENCIÓN: Reemplaza [TU-PROJECT-REF] con tu ID de proyecto de Supabase
-- ATENCIÓN: Reemplaza [TU-SERVICE-ROLE-KEY] con tu Service Role Key de Supabase
SELECT cron.schedule(
  'email_reminders_job',
  '0 * * * *',
  $$
    SELECT net.http_post(
        url:='https://[TU-PROJECT-REF].supabase.co/functions/v1/send-reminders',
        headers:='{"Authorization": "Bearer [TU-SERVICE-ROLE-KEY]"}'::jsonb
    );
  $$
);

-- Para revisar si se ejecutó:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
