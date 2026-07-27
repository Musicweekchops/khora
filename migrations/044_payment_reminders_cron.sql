-- =============================================================================
-- Migración 044: Programar cron job diario para recordatorios de cobro y continuidad
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar ejecución diaria a las 09:00 AM (Chile)
-- Reemplaza [TU-PROJECT-REF] y [TU-SERVICE-ROLE-KEY] en el dashboard de Supabase si aplica.
SELECT cron.schedule(
  'send_payment_reminders_job',
  '0 9 * * *',
  $$
    SELECT net.http_post(
        url:='https://[TU-PROJECT-REF].supabase.co/functions/v1/send-payment-reminders',
        headers:='{"Authorization": "Bearer [TU-SERVICE-ROLE-KEY]", "Content-Type": "application/json"}'::jsonb
    );
  $$
);
