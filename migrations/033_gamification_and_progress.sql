-- Migration 033: Gamification & Progress Tracking for Async LMS

-- 1. Create Module table to group lessons
CREATE TABLE IF NOT EXISTS public."Module" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public."Product"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Update Lesson table
-- We add module_id to group lessons, and xp_value for gamification
ALTER TABLE public."Lesson" ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public."Module"(id) ON DELETE CASCADE;
ALTER TABLE public."Lesson" ADD COLUMN IF NOT EXISTS xp_value INTEGER DEFAULT 50 NOT NULL;

-- 3. Create StudentProgress table to track video consumption
CREATE TABLE IF NOT EXISTS public."StudentProgress" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public."Lesson"(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED')) DEFAULT 'PENDING',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, lesson_id)
);

-- 4. Create StudentStats for Gamification (Tier List & Streaks)
CREATE TABLE IF NOT EXISTS public."StudentStats" (
  student_id UUID PRIMARY KEY REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL, -- Days or weeks, maintained by app logic
  last_practice_date DATE,
  tier TEXT NOT NULL CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'UNRANKED')) DEFAULT 'UNRANKED',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable RLS
ALTER TABLE public."Module" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StudentProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StudentStats" ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Module
DROP POLICY IF EXISTS "Teachers can manage modules for their products" ON public."Module";
CREATE POLICY "Teachers can manage modules for their products" 
ON public."Module" FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id IN (
      SELECT teacher_id FROM public."Product" WHERE id = product_id
    )
  )
);

DROP POLICY IF EXISTS "Students can view modules for purchased products" ON public."Module";
CREATE POLICY "Students can view modules for purchased products" 
ON public."Module" FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public."StudentProfile" WHERE id IN (
      SELECT student_id FROM public."Purchase" WHERE product_id = "Module".product_id AND status = 'COMPLETED'
    )
  )
  OR
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id IN (
      SELECT teacher_id FROM public."Product" WHERE id = "Module".product_id
    )
  )
);

-- 7. RLS Policies for StudentProgress
DROP POLICY IF EXISTS "Students can manage their own progress" ON public."StudentProgress";
CREATE POLICY "Students can manage their own progress" 
ON public."StudentProgress" FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public."StudentProfile" WHERE id = student_id
  )
);

DROP POLICY IF EXISTS "Teachers can view progress of their students" ON public."StudentProgress";
CREATE POLICY "Teachers can view progress of their students" 
ON public."StudentProgress" FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id IN (
      SELECT teacher_id FROM public."Product" WHERE id IN (
        SELECT product_id FROM public."Lesson" WHERE id = "StudentProgress".lesson_id
      )
    )
  )
);

-- 8. RLS Policies for StudentStats
DROP POLICY IF EXISTS "Students can view their own stats" ON public."StudentStats";
CREATE POLICY "Students can view their own stats" 
ON public."StudentStats" FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public."StudentProfile" WHERE id = student_id
  )
);

-- We allow the backend (via service role) to update stats, but students can't directly UPDATE their XP to cheat.
-- Wait, since we are Serverless and mostly client-side Supabase, we might need an edge function or RPC to safely update XP.
-- For the MVP, we will allow students to update their own stats, trusting the client momentarily, or we can use a secure RPC later.
DROP POLICY IF EXISTS "Students can update their own stats MVP" ON public."StudentStats";
CREATE POLICY "Students can update their own stats MVP" 
ON public."StudentStats" FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM public."StudentProfile" WHERE id = student_id
  )
);

DROP POLICY IF EXISTS "Students can insert their own stats MVP" ON public."StudentStats";
CREATE POLICY "Students can insert their own stats MVP" 
ON public."StudentStats" FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public."StudentProfile" WHERE id = student_id
  )
);

DROP POLICY IF EXISTS "Teachers can view stats of their students" ON public."StudentStats";
CREATE POLICY "Teachers can view stats of their students" 
ON public."StudentStats" FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile"
  )
);
