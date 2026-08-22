-- Agregar PIN de empleado a profiles
ALTER TABLE public.profiles
ADD COLUMN employee_pin VARCHAR(4) DEFAULT NULL;

-- Asegurar que los perfiles tengan permisos para ser actualizados por el propio usuario (ya cubierto por RLS original)
-- No exponemos employee_pin a otros usuarios.
