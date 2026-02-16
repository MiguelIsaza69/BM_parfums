-- Add description column to orders table for admin notes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS description TEXT;
