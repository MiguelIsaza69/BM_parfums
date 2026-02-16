-- 1. Backup data (just in case)
CREATE TABLE IF NOT EXISTS public.products_backup AS SELECT * FROM public.products;

-- 2. Drop the problematic table completely
DROP TABLE IF EXISTS public.products CASCADE;

-- 3. Recreate the table from scratch with CLEAN schema
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    gender_id UUID REFERENCES public.genders(id) ON DELETE SET NULL,
    category_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Ensure array type
    description TEXT DEFAULT '',
    price NUMERIC DEFAULT 0,
    volume_ml NUMERIC DEFAULT 0,
    quality TEXT DEFAULT 'Inspiración',
    images TEXT[] DEFAULT ARRAY[]::TEXT[] -- Explicit TEXT ARRAY to support long URLs
);

-- 4. Enable RLS (Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Re-create Policies (Permissions)
-- Policy: Everyone can view
CREATE POLICY "Public Products View" 
ON public.products FOR SELECT 
USING (true);

-- Policy: Authenticated users (Admins) can do everything
CREATE POLICY "Admin Manage Products" 
ON public.products FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- 6. Restore data from backup (mapping fields explicitly to avoid type mismatch)
INSERT INTO public.products (id, created_at, name, brand_id, gender_id, category_ids, description, price, volume_ml, quality, images)
SELECT 
    id, 
    created_at, 
    name, 
    brand_id, 
    gender_id, 
    category_ids, 
    description, 
    price, 
    volume_ml, 
    quality, 
    images -- Postgres will cast this automatically if the types align
FROM public.products_backup;

-- 7. Drop backup (Optional, keeping it commented out for safety)
-- DROP TABLE public.products_backup;
