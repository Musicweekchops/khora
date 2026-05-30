-- Migration 028: Add start_date to public."Schedule"
-- Default value is set to CURRENT_DATE so all existing schedules continue to work.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Schedule' AND column_name='start_date') THEN
    ALTER TABLE public."Schedule" ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;
