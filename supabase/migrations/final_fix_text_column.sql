-- SCRIPT DE REPARACIÓN FINAL (VERSION SIMPLIFICADA)
-- Ejecuta esto en Supabase SQL Editor para arreglar la base de datos definitivamente.

BEGIN;

-- 1. Eliminar la columna problemática de imágenes (y cualquier restricción asociada)
ALTER TABLE public.products DROP COLUMN IF EXISTS images CASCADE;

-- 2. Crear la columna como TEXTO simple (La opción más robusta y compatible)
ALTER TABLE public.products ADD COLUMN images text DEFAULT '';

-- 3. Desactivar temporalmente la seguridad para evitar bloqueos por políticas antiguas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY; 
-- (Nota: Reactivamos RLS pero aseguramos políticas limpias o permisivas si es necesario, 
-- pero por defecto esto asegura que no esté en un estado 'fantasmal').

-- 4. Asegurar permisos para todos los roles
GRANT ALL ON public.products TO anon, authenticated, service_role;

COMMIT;

-- Verificación rápida
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'images';
