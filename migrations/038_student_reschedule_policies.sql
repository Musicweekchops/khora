-- Migration 038: Allow students to reschedule (insert, update, delete) their own classes and schedules

-- 1. Policies for public."Class"
DROP POLICY IF EXISTS "class_student_insert" ON public."Class";
CREATE POLICY "class_student_insert" ON public."Class" FOR INSERT WITH CHECK (
  student_id IN (
    SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "class_student_update" ON public."Class";
CREATE POLICY "class_student_update" ON public."Class" FOR UPDATE USING (
  student_id IN (
    SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid()
  )
) WITH CHECK (
  student_id IN (
    SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "class_student_delete" ON public."Class";
CREATE POLICY "class_student_delete" ON public."Class" FOR DELETE USING (
  student_id IN (
    SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid()
  )
);

-- 2. Policies for public."Schedule"
DROP POLICY IF EXISTS "schedule_student_insert" ON public."Schedule";
CREATE POLICY "schedule_student_insert" ON public."Schedule" FOR INSERT WITH CHECK (
  student_id IN (
    SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "schedule_student_update" ON public."Schedule";
CREATE POLICY "schedule_student_update" ON public."Schedule" FOR UPDATE USING (
  student_id IN (
    SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid()
  )
) WITH CHECK (
  student_id IN (
    SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid()
  )
);
