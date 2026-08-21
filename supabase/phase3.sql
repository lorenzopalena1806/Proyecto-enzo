-- Fase 3: Stock y Deshacer transacciones

-- 1. Agregar columnas a merchant_offers
ALTER TABLE merchant_offers ADD COLUMN IF NOT EXISTS stock integer DEFAULT null;
ALTER TABLE merchant_offers ADD COLUMN IF NOT EXISTS used_count integer DEFAULT 0;

-- 2. Agregar columna de estado a discount_transactions
ALTER TABLE discount_transactions ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed';
