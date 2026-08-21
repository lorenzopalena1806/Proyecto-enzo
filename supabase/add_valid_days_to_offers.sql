-- Ejecutar este script en el editor SQL de Supabase para agregar la columna de días válidos

ALTER TABLE public.merchant_offers 
ADD COLUMN IF NOT EXISTS valid_days JSONB DEFAULT '[]'::jsonb;
