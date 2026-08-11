-- ============================================================
-- SCHEMA COMPLETO - Plataforma B2B RedBeneficios
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- 1. TABLA: profiles
-- Extiende auth.users con información de rol y negocio
-- ──────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('superadmin', 'merchant', 'client'))
                  DEFAULT 'client',
  full_name     TEXT,
  business_name TEXT,       -- Solo para merchants
  phone         TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX profiles_role_idx ON public.profiles (role);
CREATE INDEX profiles_is_active_idx ON public.profiles (is_active);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: cada usuario ve/edita solo su propio perfil
CREATE POLICY "Usuarios ven su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios editan su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Política: superadmins ven todos los perfiles
CREATE POLICY "SuperAdmin ve todos los perfiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "SuperAdmin modifica todos los perfiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- 2. TABLA: subscriptions
-- Gestiona el estado de suscripción de cada comerciante
-- ──────────────────────────────────────────────────────────────

CREATE TABLE public.subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'trial', 'expired'))
                DEFAULT 'inactive',
  plan_name   TEXT NOT NULL DEFAULT 'basic',
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,           -- NULL = sin vencimiento
  created_by  UUID REFERENCES public.profiles(id), -- SuperAdmin
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX subscriptions_merchant_id_idx ON public.subscriptions (merchant_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions (status);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants ven su propia suscripción"
  ON public.subscriptions FOR SELECT
  USING (merchant_id = auth.uid());

CREATE POLICY "SuperAdmin gestiona suscripciones"
  ON public.subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 3. TABLA: qr_codes
-- QR único por usuario (cliente o comerciante)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE public.qr_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  qr_token   TEXT NOT NULL UNIQUE, -- Token firmado dentro del QR
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX qr_codes_user_id_idx ON public.qr_codes (user_id);
CREATE INDEX qr_codes_qr_token_idx ON public.qr_codes (qr_token);
CREATE INDEX qr_codes_is_active_idx ON public.qr_codes (is_active);

-- RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve solo su propio QR
CREATE POLICY "Usuarios ven su propio QR"
  ON public.qr_codes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuarios insertan su propio QR"
  ON public.qr_codes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Los merchants pueden leer QRs de otros para validarlos al escanear
CREATE POLICY "Merchants validan QRs ajenos"
  ON public.qr_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('merchant', 'superadmin')
    )
  );

CREATE POLICY "SuperAdmin gestiona todos los QRs"
  ON public.qr_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE TRIGGER qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 4. TABLA: discount_transactions
-- Log inmutable de cada escaneo y descuento aplicado
-- ──────────────────────────────────────────────────────────────

CREATE TABLE public.discount_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_id       UUID NOT NULL REFERENCES public.profiles(id), -- Merchant que escaneó
  scanned_user_id  UUID NOT NULL REFERENCES public.profiles(id), -- Dueño del QR
  original_amount  NUMERIC(12, 2) NOT NULL CHECK (original_amount > 0),
  discount_pct     NUMERIC(5, 2) NOT NULL CHECK (discount_pct > 0 AND discount_pct <= 100),
  final_amount     NUMERIC(12, 2) NOT NULL CHECK (final_amount >= 0),
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer')),
  day_of_week      SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  applied_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes            TEXT
);

-- Índices
CREATE INDEX dt_scanner_id_idx ON public.discount_transactions (scanner_id);
CREATE INDEX dt_scanned_user_id_idx ON public.discount_transactions (scanned_user_id);
CREATE INDEX dt_applied_at_idx ON public.discount_transactions (applied_at DESC);

-- RLS
ALTER TABLE public.discount_transactions ENABLE ROW LEVEL SECURITY;

-- Merchants ven solo las transacciones donde ellos escanearon
CREATE POLICY "Merchants ven sus transacciones"
  ON public.discount_transactions FOR SELECT
  USING (scanner_id = auth.uid());

CREATE POLICY "Merchants insertan transacciones"
  ON public.discount_transactions FOR INSERT
  WITH CHECK (
    scanner_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'merchant'
    )
  );

-- SuperAdmin ve todo
CREATE POLICY "SuperAdmin ve todas las transacciones"
  ON public.discount_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 5. TABLA: marketing_assets
-- Imágenes/carruseles subidas por SuperAdmin a cada merchant
-- ──────────────────────────────────────────────────────────────

CREATE TABLE public.marketing_assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT,
  description TEXT,
  file_url    TEXT NOT NULL,   -- URL de Supabase Storage
  file_type   TEXT NOT NULL DEFAULT 'image'
                CHECK (file_type IN ('image', 'video', 'pdf')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES public.profiles(id), -- SuperAdmin
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX ma_merchant_id_idx ON public.marketing_assets (merchant_id);
CREATE INDEX ma_sort_order_idx ON public.marketing_assets (merchant_id, sort_order);

-- RLS
ALTER TABLE public.marketing_assets ENABLE ROW LEVEL SECURITY;

-- Merchants ven solo sus propios assets
CREATE POLICY "Merchants ven sus assets"
  ON public.marketing_assets FOR SELECT
  USING (merchant_id = auth.uid());

-- SuperAdmin gestiona todos los assets
CREATE POLICY "SuperAdmin gestiona assets"
  ON public.marketing_assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE TRIGGER marketing_assets_updated_at
  BEFORE UPDATE ON public.marketing_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 6. STORAGE BUCKET para imágenes de marketing
-- Ejecutar en: Supabase Dashboard → Storage
-- ──────────────────────────────────────────────────────────────

-- Crear bucket (hacer desde el Dashboard de Supabase Storage)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('marketing-assets', 'marketing-assets', true);

-- Política de storage: Solo SuperAdmin puede subir
-- CREATE POLICY "SuperAdmin uploads"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'marketing-assets' AND
--     EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE id = auth.uid() AND role = 'superadmin'
--     )
--   );

-- Política de storage: Merchants pueden ver sus archivos
-- CREATE POLICY "Public read marketing assets"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'marketing-assets');

-- ──────────────────────────────────────────────────────────────
-- 7. DATOS INICIALES (opcional, para testing)
-- ──────────────────────────────────────────────────────────────

-- NOTA: El SuperAdmin debe crearse manualmente desde el Dashboard
-- de Supabase Auth, luego actualizar su rol:
--
-- UPDATE public.profiles
-- SET role = 'superadmin'
-- WHERE id = 'UUID_DEL_SUPERADMIN';
