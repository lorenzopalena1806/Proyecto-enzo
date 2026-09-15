-- Add index for favorites queries by merchant_id
CREATE INDEX IF NOT EXISTS favorites_merchant_id_idx ON public.favorites (merchant_id);
