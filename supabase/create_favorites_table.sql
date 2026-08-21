-- Ejecutar este script en el editor SQL de Supabase para habilitar los Favoritos

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, merchant_id)
);

-- Habilitar RLS (opcional si lo manejan desde service_role, pero buena práctica)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas simples
CREATE POLICY "Users can view their own favorites"
    ON public.favorites FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Users can insert their own favorites"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can delete their own favorites"
    ON public.favorites FOR DELETE
    USING (auth.uid() = client_id);
