-- FIX FOR MISSING RELATIONSHIP COLUMNS
-- This script ensures that all tables have the necessary columns for RLS policies

-- 1. Ensure StudentProfile has teacherId
ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "teacherId" UUID REFERENCES "TeacherProfile"(id);

-- 2. Ensure Class has teacherId and studentId
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "teacherId" UUID REFERENCES "TeacherProfile"(id);
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "studentId" UUID REFERENCES "StudentProfile"(id);

-- 3. Ensure Payment has studentId
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "studentId" UUID REFERENCES "StudentProfile"(id);

-- 4. Ensure TeacherProfile has userId
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE;

-- 5. Ensure Task has assignedToId and authorId
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "assignedToId" UUID REFERENCES "User"(id);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "authorId" UUID REFERENCES "User"(id);
