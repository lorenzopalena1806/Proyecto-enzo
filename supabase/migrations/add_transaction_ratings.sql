-- Agregar columnas rating y feedback a discount_transactions
ALTER TABLE public.discount_transactions
ADD COLUMN rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN feedback TEXT;

-- No se requieren políticas nuevas ya que el cliente puede actualizar 
-- a través del Server Action que usa createAdminClient.
