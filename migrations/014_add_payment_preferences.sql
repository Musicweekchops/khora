-- Añadir campos para controlar las preferencias de pago del alumno
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'MONTHLY';
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS payment_day INTEGER DEFAULT 5;
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC DEFAULT 0;
