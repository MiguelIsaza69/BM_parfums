-- NUCLEAR OPTION: Recreate table with JSONB for images
-- This fixes issues with text[] arrays and potential corruption
-- WARNING: This empties the products table (which seems okay as you deleted products)

DROP TABLE IF EXISTS public.products CASCADE;

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    volume_ml numeric,
    quality text default 'Inspiración',
    
    -- Foreign Keys
    brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
    gender_id uuid REFERENCES public.genders(id) ON DELETE SET NULL,
    
    -- ARRAYS AS JSONB (Much safer/more robust than text[])
    category_ids jsonb DEFAULT '[]'::jsonb, 
    images jsonb DEFAULT '[]'::jsonb,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS but create a permissive policy for now to ensure it works
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Disable Realtime to prevent large payload hangs
ALTER PUBLICATION supabase_realtime DROP TABLE public.products;
