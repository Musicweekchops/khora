-- Migration 029: Create ScheduleWaitingList table
-- Allows prospective students to register their interest in busy slots.
-- Only authorized teachers can access their own waiting list records.

CREATE TABLE IF NOT EXISTS public."ScheduleWaitingList" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
  prospect_name TEXT NOT NULL,
  prospect_email TEXT NOT NULL,
  prospect_phone TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = Domingo, 1 = Lunes, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public."ScheduleWaitingList" ENABLE ROW LEVEL SECURITY;

-- Security Policy: Teachers can manage (select, insert, update, delete) their own waiting list
CREATE POLICY "Teachers can manage their own waiting list" 
ON public."ScheduleWaitingList"
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id = teacher_id
  )
);

-- Public Policy: Anyone (prospective student) can insert a record (to register)
CREATE POLICY "Anyone can register to waitlist"
ON public."ScheduleWaitingList"
FOR INSERT
WITH CHECK (true);
