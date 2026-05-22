-- Migration 026: Create PushSubscription table for PWA web push notifications
CREATE TABLE IF NOT EXISTS public."PushSubscription" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on PushSubscription
ALTER TABLE public."PushSubscription" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select their own push subscriptions
DROP POLICY IF EXISTS "user_self_push_select" ON public."PushSubscription";
CREATE POLICY "user_self_push_select" ON public."PushSubscription"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own push subscriptions
DROP POLICY IF EXISTS "user_self_push_insert" ON public."PushSubscription";
CREATE POLICY "user_self_push_insert" ON public."PushSubscription"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own push subscriptions
DROP POLICY IF EXISTS "user_self_push_delete" ON public."PushSubscription";
CREATE POLICY "user_self_push_delete" ON public."PushSubscription"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
