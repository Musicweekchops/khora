-- FIX FOR USER ID DEFAULT CONFLICT
-- This change allows multiple users to be created without ID conflicts

-- 1. Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Change the default value of the "id" column in the "User" table
-- Note: We use ALTER TABLE ... ALTER COLUMN ... SET DEFAULT
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- 3. Verify the change (optional)
-- SELECT column_name, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'User' AND column_name = 'id';
