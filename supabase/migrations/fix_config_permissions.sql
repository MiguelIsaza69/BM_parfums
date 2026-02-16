-- Fix permissions for configuration tables (brands, hero_slides)
-- Often RLS prevents updates if not explicitly allowed

BEGIN;

-- 1. Brands
ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.brands TO anon, authenticated, service_role;

-- 2. Hero Slides
ALTER TABLE public.hero_slides DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.hero_slides TO anon, authenticated, service_role;

-- 3. Genders/Categories (Just in case)
ALTER TABLE public.genders DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.genders TO anon, authenticated, service_role;

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.categories TO anon, authenticated, service_role;

COMMIT;
