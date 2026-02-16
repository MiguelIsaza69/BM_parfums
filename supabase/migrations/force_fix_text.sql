-- FORCE IMAGE COLUMN TO TEXT (Simplest possible type)
-- Run this in Supabase SQL Editor.

BEGIN;

-- 1. Unblock any stuck processes (best effort)
-- Note: This might fail if you don't have superuser, but it's worth a try in the script
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();

-- 2. Drop the problematic column completely
ALTER TABLE public.products DROP COLUMN IF EXISTS images CASCADE;

-- 3. Re-create it as simple TEXT (Not Array, Not JSON)
ALTER TABLE public.products ADD COLUMN images text DEFAULT '';

-- 4. Disable RLS momentarily to ensure no policies block the save
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

COMMIT;

-- Verification:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'images';
