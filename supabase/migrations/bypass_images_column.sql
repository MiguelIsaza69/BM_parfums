-- Add a new JSONB column for images to bypass technical issues with the text[] column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images_json JSONB DEFAULT '[]'::jsonb;

-- Optional: Migrate existing data if needed (safe to run even if empty)
UPDATE public.products 
SET images_json = to_jsonb(images) 
WHERE images IS NOT NULL AND images_json = '[]'::jsonb;
