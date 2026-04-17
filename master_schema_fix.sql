-- MASTER SCHEMA NORMALIZATION
-- This script fixes all "uuid vs text" type mismatches once and for all.
-- It ensures all IDs and Foreign Keys use TEXT, which is compatible with both Prisma and Supabase Auth.

-- 1. Disable all triggers temporarily
SET session_replication_role = 'replica';

-- 2. Drop existing foreign keys that might cause conflicts during type change
DO $$ 
BEGIN
    -- This block drops common FKs if they exist using string_agg for robustness
    EXECUTE (SELECT COALESCE(string_agg('ALTER TABLE "StudentProfile" DROP CONSTRAINT IF EXISTS "' || constraint_name || '"', '; '), 'SELECT 1')
             FROM information_schema.key_column_usage 
             WHERE table_name = 'StudentProfile' AND (column_name = 'userId' OR column_name = 'teacherId'));
    
    EXECUTE (SELECT COALESCE(string_agg('ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "' || constraint_name || '"', '; '), 'SELECT 1')
             FROM information_schema.key_column_usage 
             WHERE table_name = 'Class' AND (column_name = 'studentId' OR column_name = 'teacherId' OR column_name = 'bookingId'));

    EXECUTE (SELECT COALESCE(string_agg('ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "' || constraint_name || '"', '; '), 'SELECT 1')
             FROM information_schema.key_column_usage 
             WHERE table_name = 'Payment' AND (column_name = 'studentId'));

    EXECUTE (SELECT COALESCE(string_agg('ALTER TABLE "TeacherProfile" DROP CONSTRAINT IF EXISTS "' || constraint_name || '"', '; '), 'SELECT 1')
             FROM information_schema.key_column_usage 
             WHERE table_name = 'TeacherProfile' AND (column_name = 'userId'));
END $$;

-- 3. Normalize Table: User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "User" ALTER COLUMN "id" TYPE TEXT;

-- 4. Normalize Table: TeacherProfile
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "TeacherProfile" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "TeacherProfile" ALTER COLUMN "userId" TYPE TEXT;

-- 5. Normalize Table: StudentProfile
ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "StudentProfile" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "StudentProfile" ALTER COLUMN "userId" TYPE TEXT;
ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "teacherId" TEXT;
ALTER TABLE "StudentProfile" ALTER COLUMN "teacherId" TYPE TEXT;

-- 6. Normalize Table: Class
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "Class" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "studentId" TEXT;
ALTER TABLE "Class" ALTER COLUMN "studentId" TYPE TEXT;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "teacherId" TEXT;
ALTER TABLE "Class" ALTER COLUMN "teacherId" TYPE TEXT;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "bookingId" TEXT;
ALTER TABLE "Class" ALTER COLUMN "bookingId" TYPE TEXT;

-- 7. Normalize Table: Payment
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "Payment" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "studentId" TEXT;
ALTER TABLE "Payment" ALTER COLUMN "studentId" TYPE TEXT;

-- 8. Normalize Table: Booking
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "Booking" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "classTypeId" TEXT;
ALTER TABLE "Booking" ALTER COLUMN "classTypeId" TYPE TEXT;

-- 9. Normalize Table: ClassType
ALTER TABLE "ClassType" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "ClassType" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "ClassType" ADD COLUMN IF NOT EXISTS "teacherId" TEXT;
ALTER TABLE "ClassType" ALTER COLUMN "teacherId" TYPE TEXT;

-- 10. Normalize Table: Task
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "Task" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "assignedToId" TEXT;
ALTER TABLE "Task" ALTER COLUMN "assignedToId" TYPE TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "authorId" TEXT;
ALTER TABLE "Task" ALTER COLUMN "authorId" TYPE TEXT;

-- 10. Re-add Foreign Key Constraints (safely)
DO $$ 
BEGIN
    -- StudentProfile -> User
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'StudentProfile_userId_fkey') THEN
        ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
    END IF;

    -- StudentProfile -> TeacherProfile
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'StudentProfile_teacherId_fkey') THEN
        ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"(id);
    END IF;

    -- Class -> StudentProfile
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Class_studentId_fkey') THEN
        ALTER TABLE "Class" ADD CONSTRAINT "Class_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"(id);
    END IF;

    -- Class -> TeacherProfile
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Class_teacherId_fkey') THEN
        ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"(id);
    END IF;
END $$;

-- 11. Re-enable triggers
SET session_replication_role = 'origin';
