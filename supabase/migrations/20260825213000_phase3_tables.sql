ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_seen_tutorial BOOLEAN DEFAULT false; ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false; 
