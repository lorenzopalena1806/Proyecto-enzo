-- Ejecutar este script en el editor SQL de Supabase
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT;
