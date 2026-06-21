-- Migration 032: Premium Products, Structured Course Lessons, Downloadable Resources, and Subscription Plans.
-- Expands Product and StudentProfile tables, creates Lesson and ProductResource tables with security policies (RLS).

-- 1. Extend public.Product with type and duration columns
ALTER TABLE public."Product" ADD COLUMN IF NOT EXISTS type TEXT NOT NULL CHECK (type IN ('COURSE', 'PLAN')) DEFAULT 'COURSE';
ALTER TABLE public."Product" ADD COLUMN IF NOT EXISTS duration_months INTEGER DEFAULT 1;

-- 2. Extend public.StudentProfile with subscription_expires_at column to support prepay plans
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- 3. Create public.Lesson table for structured course lessons
CREATE TABLE IF NOT EXISTS public."Lesson" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public."Product"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- YouTube, Vimeo, etc. playable on-page
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create public.ProductResource table for course downloads
CREATE TABLE IF NOT EXISTS public."ProductResource" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public."Product"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  download_url TEXT NOT NULL, -- Drive files, PDFs, etc.
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public."Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductResource" ENABLE ROW LEVEL SECURITY;

-- 6. Setup Security Policies for Lesson
DROP POLICY IF EXISTS "Teachers can manage lessons for their products" ON public."Lesson";
CREATE POLICY "Teachers can manage lessons for their products" 
ON public."Lesson"
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id IN (
      SELECT teacher_id FROM public."Product" WHERE id = product_id
    )
  )
);

DROP POLICY IF EXISTS "Students can view lessons for purchased products" ON public."Lesson";
CREATE POLICY "Students can view lessons for purchased products" 
ON public."Lesson"
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public."StudentProfile" WHERE id IN (
      SELECT student_id FROM public."Purchase" WHERE product_id = "Lesson".product_id AND status = 'COMPLETED'
    )
  )
  OR
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id IN (
      SELECT teacher_id FROM public."Product" WHERE id = "Lesson".product_id
    )
  )
);

-- 7. Setup Security Policies for ProductResource
DROP POLICY IF EXISTS "Teachers can manage resources for their products" ON public."ProductResource";
CREATE POLICY "Teachers can manage resources for their products" 
ON public."ProductResource"
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id IN (
      SELECT teacher_id FROM public."Product" WHERE id = product_id
    )
  )
);

DROP POLICY IF EXISTS "Students can view resources for purchased products" ON public."ProductResource";
CREATE POLICY "Students can view resources for purchased products" 
ON public."ProductResource"
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public."StudentProfile" WHERE id IN (
      SELECT student_id FROM public."Purchase" WHERE product_id = "ProductResource".product_id AND status = 'COMPLETED'
    )
  )
  OR
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id IN (
      SELECT teacher_id FROM public."Product" WHERE id = "ProductResource".product_id
    )
  )
);

-- 8. Decouple Booking from rigid class types for quick landing page conversions
ALTER TABLE public."Booking" ALTER COLUMN class_type_id DROP NOT NULL;

