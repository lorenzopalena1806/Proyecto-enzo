-- Add image display options to merchant_offers
ALTER TABLE merchant_offers 
ADD COLUMN IF NOT EXISTS image_display_mode TEXT DEFAULT 'background',
ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'object-center';
