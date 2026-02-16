-- 1. Asegurar que RLS esta activado para seguridad
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar politicas viejas para evitar conflictos
DROP POLICY IF EXISTS "Public View Products" ON public.products;
DROP POLICY IF EXISTS "Admin Manage Products" ON public.products;
DROP POLICY IF EXISTS "Authenticated Insert" ON public.products;
DROP POLICY IF EXISTS "Authenticated Update" ON public.products;
DROP POLICY IF EXISTS "Authenticated Delete" ON public.products;

-- 3. Crear POLÍTICAS PERMISIVAS (Reglas de acceso)
-- Todo el mundo puede VER los productos
CREATE POLICY "Public View Products" ON public.products 
FOR SELECT USING (true);

-- Solo usuarios autenticados (Admins) pueden CREAR, EDITAR, BORRAR
-- Usamos 'authenticated' para asegurar que funcione con tu sesión actual
CREATE POLICY "Admin Insert Products" ON public.products 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin Update Products" ON public.products 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Delete Products" ON public.products 
FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Asegurar que category_ids sea un array de UUIDs valido
ALTER TABLE public.products 
ALTER COLUMN category_ids SET DEFAULT array[]::uuid[],
ALTER COLUMN category_ids SET NOT NULL;
