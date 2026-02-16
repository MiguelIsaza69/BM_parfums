-- SCRIPT PARA ARREGLAR BLOQUEO POR DESCRIPCIÓN
-- Este script elimina índices de búsqueda y validaciones que pueden estar colapsando
-- cuando se guarda texto con acentos o caracteres especiales.

BEGIN;

-- 1. Eliminar índices de búsqueda que podrían estar corruptos (tsvector, trgm)
DROP INDEX IF EXISTS products_description_idx;
DROP INDEX IF EXISTS products_description_search_idx;
DROP INDEX IF EXISTS products_fts_idx;

-- 2. Asegurar que la columna descripción es TEXTO simple sin límites raros
ALTER TABLE public.products ALTER COLUMN description TYPE text;

-- 3. ELIMINAR CUALQUIER TRIGGER RESTANTE (Intentamos por nombre común también)
DROP TRIGGER IF EXISTS on_product_created ON public.products;
DROP TRIGGER IF EXISTS on_product_updated ON public.products;
DROP TRIGGER IF EXISTS embed_product_description ON public.products; -- Común en Supabase AI
DROP TRIGGER IF EXISTS products_encrypt_secret_trigger ON public.products;

-- 4. Re-ejecutar eliminación genérica de triggers por si acaso
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'products') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.products CASCADE';
    END LOOP;
END $$;

COMMIT;
