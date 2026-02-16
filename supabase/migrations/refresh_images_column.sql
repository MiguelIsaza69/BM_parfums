-- 1. Rename the potentially problematic column to a temporary backup
ALTER TABLE public.products RENAME COLUMN images TO images_bak;

-- 2. Create a clean, fresh 'images' column guaranteed to be text[]
ALTER TABLE public.products ADD COLUMN images text[] DEFAULT ARRAY[]::text[];

-- 3. (Optional) Try to migrate old data back (safely)
-- If this fails, we know the data itself is corrupt or problematic
UPDATE public.products SET images = images_bak WHERE images_bak IS NOT NULL;

-- 4. Drop the backup column only after successful migration (if desired, or leave it for safety)
-- DROP COLUMN images_bak;
