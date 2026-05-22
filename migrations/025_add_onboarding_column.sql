-- Migration 025: Add completed_onboarding column to User table and ensure self-update policy
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS completed_onboarding BOOLEAN DEFAULT FALSE;

-- Ensure that a user can update their own User profile (for completed_onboarding or other self-service updates)
DROP POLICY IF EXISTS "user_self_update" ON public."User";
CREATE POLICY "user_self_update" ON public."User"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure that a user can read their own User profile
DROP POLICY IF EXISTS "user_self_read" ON public."User";
CREATE POLICY "user_self_read" ON public."User"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
