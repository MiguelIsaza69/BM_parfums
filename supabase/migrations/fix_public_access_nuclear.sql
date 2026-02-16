-- Super Nuclear RLS Fix for Public Read Access
-- This ensures that ANYONE (even without login) can VIEW all the content
-- This fixes the issue where "images/brands don't load" for visitors

BEGIN;

-- 1. Brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Brands" ON public.brands;
DROP POLICY IF EXISTS "Aybody can view brands" ON public.brands;
DROP POLICY IF EXISTS "Public Select" ON public.brands;
CREATE POLICY "Public Select Brands" ON public.brands FOR SELECT TO anon, authenticated, service_role USING (true);

-- 2. Hero Slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Hero" ON public.hero_slides;
DROP POLICY IF EXISTS "Public Select" ON public.hero_slides;
CREATE POLICY "Public Select Hero" ON public.hero_slides FOR SELECT TO anon, authenticated, service_role USING (true);

-- 3. Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public View Products" ON public.products;
DROP POLICY IF EXISTS "Public Select" ON public.products;
CREATE POLICY "Public View Products" ON public.products FOR SELECT TO anon, authenticated, service_role USING (true);

-- 4. Categories & Genders
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Categories" ON public.categories;
CREATE POLICY "Public Select Categories" ON public.categories FOR SELECT TO anon, authenticated, service_role USING (true);

ALTER TABLE public.genders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Genders" ON public.genders;
CREATE POLICY "Public Select Genders" ON public.genders FOR SELECT TO anon, authenticated, service_role USING (true);

COMMIT;
