-- Run this strictly in Supabase SQL Editor to restore the critical foreign key
-- that was accidentally deleted during the previous backend migration.

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'TeacherProfile_userId_fkey'
    ) THEN
        ALTER TABLE "TeacherProfile" 
        ADD CONSTRAINT "TeacherProfile_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"(id) 
        ON DELETE CASCADE;
    END IF;
END $$;
