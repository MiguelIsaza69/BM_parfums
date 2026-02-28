-- Migration to add soft delete (inhabilital) capability to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing products to be active (if they were created before this column)
UPDATE public.products SET is_active = true WHERE is_active IS NULL;
