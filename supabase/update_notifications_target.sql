-- Agregar columna target_merchant_id a la tabla global_notifications
ALTER TABLE public.global_notifications 
ADD COLUMN IF NOT EXISTS target_merchant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Actualizar la política RLS para asegurar que un comercio pueda leer:
-- 1. Notificaciones globales (target_merchant_id IS NULL)
-- 2. Notificaciones dirigidas a su ID (target_merchant_id = auth.uid())

DROP POLICY IF EXISTS "Allow authenticated users to read global notifications" ON public.global_notifications;

CREATE POLICY "Allow authenticated users to read their notifications"
ON public.global_notifications
FOR SELECT
TO authenticated
USING (
  target_merchant_id IS NULL 
  OR 
  target_merchant_id = auth.uid()
);
