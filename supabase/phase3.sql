-- Phase 3 Schema Additions

-- 1. Límite de stock en ofertas
ALTER TABLE public.merchant_offers 
ADD COLUMN IF NOT EXISTS stock_limit INTEGER NULL,
ADD COLUMN IF NOT EXISTS used_count INTEGER NOT NULL DEFAULT 0;

-- 2. Estado de transacción (para Deshacer Cobro)
ALTER TABLE public.discount_transactions
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
CHECK (status IN ('completed', 'cancelled', 'refunded'));

-- 3. Transacciones deben guardar a qué oferta pertenecen para descontar stock al deshacer
ALTER TABLE public.discount_transactions
ADD COLUMN IF NOT EXISTS offer_id UUID NULL REFERENCES public.merchant_offers(id) ON DELETE SET NULL;

-- Para los registros existentes
UPDATE public.discount_transactions SET status = 'completed' WHERE status IS NULL;
