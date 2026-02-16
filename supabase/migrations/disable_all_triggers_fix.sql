-- SCRIPT DE DESBLOQUEO TOTAL (KILL TRIGGERS)
-- Ejecuta esto si el guardado se queda colgado "Guardando..."
-- Esto desactiva análisis automáticos o IAs que puedan estar bloqueando la descripción.

BEGIN;

-- 1. Asegurar RLS desactivado (Permiso total)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODOS LOS TRIGGERS de la tabla productos
-- Estos son programas en segundo plano que leen lo que guardas y pueden colgarse
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'products') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.products CASCADE';
        RAISE NOTICE 'Trigger eliminado: %', r.trigger_name;
    END LOOP;
END $$;

COMMIT;
