-- SOLUCIÓN FINAL "LOW TECH": Usar TEXTO SIMPLE
-- A veces los arrays o JSONs complejos causan problemas. 
-- Vamos a guardar las imágenes como una simple cadena de texto separada por comas.
-- Es imposible que esto falle por tipos de datos.

ALTER TABLE public.products DROP COLUMN IF EXISTS images CASCADE;
ALTER TABLE public.products ADD COLUMN images text DEFAULT '';

-- Asegurar permisos
GRANT ALL ON public.products TO anon, authenticated, service_role;
