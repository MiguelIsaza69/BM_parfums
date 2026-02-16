-- SOLUCIÓN DEFINITIVA Y SIMPLE
-- 1. Eliminar columna problemática
ALTER TABLE public.products DROP COLUMN IF EXISTS images CASCADE;

-- 2. Crear columna SIMPLE de TEXTO
ALTER TABLE public.products ADD COLUMN images text DEFAULT '';

-- 3. Permisos
GRANT ALL ON public.products TO anon, authenticated, service_role;
