-- DISABLE RLS and DROP TRIGGERS to fix hanging inserts
-- Run this in Supabase SQL Editor

-- 1. Disable Row Level Security temporarily to rule out policy hangs
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 2. Drop any existing triggers that might be causing deadlocks or loops
DROP TRIGGER IF EXISTS on_auth_user_created ON public.products;
DROP TRIGGER IF EXISTS update_products_modtime ON public.products;
-- Drop any other custom triggers you might have added (generic catch-all)
DO $$ 
DECLARE 
    trg_name text;
BEGIN 
    FOR trg_name IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'products' 
        AND trigger_schema = 'public'
    LOOP 
        EXECUTE 'DROP TRIGGER ' || trg_name || ' ON public.products;'; 
    END LOOP; 
END $$;

-- 3. Ensure the column is clean
ALTER TABLE public.products ALTER COLUMN images TYPE text[] USING images::text[];
ALTER TABLE public.products ALTER COLUMN images SET DEFAULT '{}'::text[];

-- 4. Verify we can insert a dummy record (optional, just to check DB health)
-- INSERT INTO public.products (name, price, images) VALUES ('Test DB Health', 100, ARRAY['https://google.com/test.jpg']);
