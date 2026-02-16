-- ¡SOLUCIÓN FINAL! --
-- 1. Eliminar la columna problemática
ALTER TABLE public.products DROP COLUMN IF EXISTS images CASCADE;

-- 2. Crearla de nuevo como JSONB (Mucho más robusto)
ALTER TABLE public.products ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- 3. Asegurar permisos
GRANT ALL ON public.products TO anon, authenticated, service_role;
