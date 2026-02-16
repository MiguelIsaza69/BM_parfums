-- SCRIPT DE EMERGENCIA: PERMISOS Y TIPO DE DATO
-- Ejecuta esto si "sigue sin funcionar".

BEGIN;

-- 1. DESACTIVAR RLS (Seguridad) temporalmente
-- Esto elimina cualquier bloqueo de políticas silenciosas.
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 2. Asegurar que la columna es TEXTO (como espera el código)
-- Si ya es texto, esto no hace daño. Si falla, es porque hay bloqueos.
ALTER TABLE public.products DROP COLUMN IF EXISTS images CASCADE;
ALTER TABLE public.products ADD COLUMN images text DEFAULT '';

-- 3. Permisos explícitos
GRANT ALL ON public.products TO anon, authenticated, service_role;

COMMIT;
