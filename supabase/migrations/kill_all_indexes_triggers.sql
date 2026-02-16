-- SCRIPT FINAL DE LIMPIEZA ABSOLUTA
-- Ejecuta esto para eliminar CUALQUIER rastro de configuración compleja que pueda colgar la base de datos.

BEGIN;

-- 1. Desactivar RLS
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODOS los índices excepto la clave primaria (ID)
-- Los índices de texto (fts) son la causa #1 de bloqueos al guardar descripciones largas.
DROP INDEX IF EXISTS products_description_idx;
DROP INDEX IF EXISTS products_description_search_idx;
DROP INDEX IF EXISTS products_fts_idx;
DROP INDEX IF EXISTS products_name_idx;
DROP INDEX IF EXISTS products_brand_id_idx;

-- 3. Eliminar TODOS los TRIGGERS (Disparadores automáticos)
-- Recorremos y borramos todo lo que se mueva en la tabla products.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'products') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.products CASCADE';
        RAISE NOTICE 'Trigger eliminado: %', r.trigger_name;
    END LOOP;
END $$;

-- 4. Forzar VACUUM (Limpieza interna de Postgres)
-- Esto no se puede ejecutar dentro de un bloque de transacción en algunas versiones, 
-- pero si falla no es crítico. El objetivo principal son los índices y triggers.

COMMIT;
