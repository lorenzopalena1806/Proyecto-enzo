-- Agregar columna is_featured a la tabla profiles
ALTER TABLE public.profiles
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;

-- No es necesario actualizar políticas ya que las políticas de lectura actuales 
-- permiten leer la tabla completa. Los superadmins ya pueden hacer UPDATE a todo.
