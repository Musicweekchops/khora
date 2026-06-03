-- Migration 035: Add meta_pixel_id to TeacherBillingConfig and add SELECT policy for everyone
ALTER TABLE public."TeacherBillingConfig" ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT;

-- Drop policy if it exists and recreate it to make sure public read works
DROP POLICY IF EXISTS "Public read billing config" ON public."TeacherBillingConfig";
CREATE POLICY "Public read billing config"
ON public."TeacherBillingConfig"
FOR SELECT
USING (true);

NOTIFY pgrst, 'reload schema';
