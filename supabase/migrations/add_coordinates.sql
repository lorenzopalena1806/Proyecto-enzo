-- Add latitude and longitude to profiles
ALTER TABLE public.profiles
ADD COLUMN latitude FLOAT,
ADD COLUMN longitude FLOAT,
ADD COLUMN address TEXT;
