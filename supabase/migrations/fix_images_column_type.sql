-- Asegurar que la columna images es del tipo correcto (Array de Texto) y sin límite de longitud
ALTER TABLE public.products 
ALTER COLUMN images TYPE text[] USING images::text[];

-- Asegurar que tenga un valor por defecto
ALTER TABLE public.products 
ALTER COLUMN images SET DEFAULT array[]::text[];
