-- Migration 030: Create TeacherBillingConfig and extend Payment for Mercado Pago
-- Configures exclusive payment configurations for teachers and prevents duplicate webhook inserts.

CREATE TABLE IF NOT EXISTS public."TeacherBillingConfig" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID UNIQUE NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  mp_access_token TEXT, -- Private Token (Production)
  mp_public_key TEXT,   -- Public Key (Production)
  mp_sandbox_token TEXT, -- Private Token (Sandbox)
  mp_sandbox_key TEXT,   -- Public Key (Sandbox)
  sandbox_mode BOOLEAN DEFAULT true NOT NULL,
  gateway_enabled BOOLEAN DEFAULT false NOT NULL,
  trial_class_price INTEGER DEFAULT 25000 NOT NULL, -- Default trial price $25,000 CLP as requested
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on TeacherBillingConfig
ALTER TABLE public."TeacherBillingConfig" ENABLE ROW LEVEL SECURITY;

-- Security Policy: Teachers can read, insert, update and manage their own billing credentials
CREATE POLICY "Teachers can manage their own billing config"
ON public."TeacherBillingConfig"
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id = teacher_id
  )
);

-- Extend public.Payment with mp_payment_id to ensure idempotency (no duplicate webhook inserts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'Payment' 
      AND column_name = 'mp_payment_id'
  ) THEN
    ALTER TABLE public."Payment" ADD COLUMN mp_payment_id TEXT UNIQUE;
  END IF;
END $$;
