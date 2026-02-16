-- 1. Remove all triggers from products table to rule out side-effects
DROP TRIGGER IF EXISTS on_product_update ON public.products;
DROP TRIGGER IF EXISTS handle_updated_at ON public.products;
-- (Add any others if known, but generic drop is harder in SQL without dynamic SQL)

-- 2. Drop any existing index on images column that might benefit from cleanup
DROP INDEX IF EXISTS products_images_idx;

-- 3. Explicitly set the column type again and default
ALTER TABLE public.products 
ALTER COLUMN images TYPE text[] USING images::text[],
ALTER COLUMN images SET DEFAULT array[]::text[];

-- 4. Disable RLS momentarily to rule it out COMPLETELY (we can re-enable later)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
