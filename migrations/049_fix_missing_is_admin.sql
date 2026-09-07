-- Run this in your Supabase SQL Editor to fix the missing column error
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
