CREATE TABLE IF NOT EXISTS public.global_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;

-- Permitir a cualquier usuario autenticado (dueños y clientes) ver las notificaciones activas
CREATE POLICY "Allow authenticated users to read global notifications"
ON public.global_notifications
FOR SELECT
TO authenticated
USING (true);
