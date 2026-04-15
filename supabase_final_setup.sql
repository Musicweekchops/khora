-- DEFINITIVE SUPABASE SCHEMA FOR KHORA DRUM SCHOOL
-- This schema matches the Native SDK implementation

-- 1. ENUMS (Wait, we'll use TEXT for simplicity in SDK if preferred, but Enums are fine if handled)
-- Actually, let's keep it simple with TEXT + Constraints for maximum SDK compatibility

-- 2. TABLES

CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT auth.uid(),
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT DEFAULT 'STUDENT', -- 'ADMIN', 'TEACHER', 'STUDENT'
    "image" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TeacherProfile" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
    "bio" TEXT,
    "specialties" TEXT[],
    "experience" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "StudentProfile" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
    "phone" TEXT,
    "instrument" TEXT,
    "level" TEXT,
    "notes" TEXT,
    "joinDate" TIMESTAMPTZ DEFAULT NOW(),
    "status" TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'TRIAL'
    "trialDate" TIMESTAMPTZ,
    "totalPayments" FLOAT DEFAULT 0,
    "totalClasses" INTEGER DEFAULT 0,
    "performanceScore" FLOAT DEFAULT 0,
    "totalTasks" INTEGER DEFAULT 0,
    "completedTasks" INTEGER DEFAULT 0,
    "lastClassDate" TIMESTAMPTZ,
    "teacherId" UUID REFERENCES "TeacherProfile"(id),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ClassType" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" FLOAT NOT NULL,
    "currency" TEXT DEFAULT 'CLP',
    "isActive" BOOLEAN DEFAULT true,
    "sortOrder" INTEGER DEFAULT 0,
    "icon" TEXT,
    "teacherId" UUID REFERENCES "TeacherProfile"(id),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Booking" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "classTypeId" UUID REFERENCES "ClassType"(id),
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL, -- Format "HH:mm"
    "endTime" TEXT NOT NULL,   -- Format "HH:mm"
    "status" TEXT DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
    "isParent" BOOLEAN DEFAULT false,
    "isMonthlyPlan" BOOLEAN DEFAULT false,
    "totalPrice" FLOAT DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Class" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "bookingId" UUID REFERENCES "Booking"(id) ON DELETE SET NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT, -- Format "HH:mm"
    "endTime" TEXT,   -- Format "HH:mm"
    "duration" INTEGER,
    "status" TEXT DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'ABSENT', 'RECOVERED'
    "attendanceStatus" TEXT, -- 'PRESENT', 'ABSENT', 'JUSTIFIED'
    "isRecovery" BOOLEAN DEFAULT false,
    "originalClassId" UUID,
    "needsRenewalReminder" BOOLEAN DEFAULT false,
    "expiresAt" TIMESTAMPTZ,
    "studentId" UUID REFERENCES "StudentProfile"(id),
    "teacherId" UUID REFERENCES "TeacherProfile"(id),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID REFERENCES "StudentProfile"(id),
    "amount" FLOAT NOT NULL,
    "date" DATE NOT NULL,
    "method" TEXT NOT NULL, -- 'TRANSFER', 'CASH', 'LINK'
    "status" TEXT DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED'
    "description" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Task" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT,
    "status" TEXT DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED'
    "priority" TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    "dueDate" DATE,
    "assignedToId" UUID REFERENCES "User"(id),
    "authorId" UUID REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Availability" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "teacherId" UUID REFERENCES "TeacherProfile"(id),
    "dayOfWeek" INTEGER NOT NULL, -- 0-6
    "startTime" TEXT NOT NULL, -- "HH:mm"
    "endTime" TEXT NOT NULL,   -- "HH:mm"
    "slotDuration" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "AvailabilityException" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "teacherId" UUID REFERENCES "TeacherProfile"(id),
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "MonthlyLimits" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT,
    "phone" TEXT,
    "month" TEXT NOT NULL, -- "YYYY-MM"
    "trialClassesTaken" INTEGER DEFAULT 0,
    "reschedulesUsed" INTEGER DEFAULT 0,
    "recoveriesUsed" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("email", "phone", "month")
);

CREATE TABLE IF NOT EXISTS "ClassNote" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID REFERENCES "Class"(id) ON DELETE CASCADE,
    "studentId" UUID REFERENCES "StudentProfile"(id) ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "topics" TEXT, -- JSON string or comma separated
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS (Row Level Security) - Basic Setup
-- NOTE: Standard usage for this internal app relies on Admin SDK for many mutations,
-- but we enable RLS to be safe.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;

-- 4. INDICES
DROP INDEX IF EXISTS idx_booking_email;
CREATE INDEX idx_booking_email ON "Booking"("email");

DROP INDEX IF EXISTS idx_class_date;
CREATE INDEX idx_class_date ON "Class"("date");

DROP INDEX IF EXISTS idx_student_teacher;
CREATE INDEX idx_student_teacher ON "StudentProfile"("teacherId");

-- 5. TRIGGER FOR updatedAt (Optional but recommended)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_modtime ON "User";
CREATE TRIGGER update_user_modtime BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- Add for other tables as needed
