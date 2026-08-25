-- Agregar columna de horarios a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_hours text;
