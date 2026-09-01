// ============================================================
// TIPOS GLOBALES DE TYPESCRIPT
// Plataforma B2B de Beneficios para Comerciantes Locales
// ============================================================

// ------ ROLES -----------------------------------------------
export type UserRole = 'superadmin' | 'merchant' | 'client';

// ------ PERFIL DE USUARIO -----------------------------------
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  business_name: string | null; // Solo para merchants
  phone: string | null;
  avatar_url: string | null;
  maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  business_hours: string | null;
  subscription_expires_at: string | null;
  material_status?: 'none' | 'requested' | 'delivered';
  has_seen_tutorial?: boolean;
  is_premium?: boolean;
  is_active: boolean;
  created_at: string;
}

// ------ SUCURSALES (MÚLTIPLES LOCALES) -------------------------
export interface MerchantBranch {
  id: string;
  merchant_id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
}

// ------ SUSCRIPCIÓN -----------------------------------------
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired';

export interface Subscription {
  id: string;
  merchant_id: string;
  status: SubscriptionStatus;
  plan_name: string;
  started_at: string;
  expires_at: string | null;
  created_by: string | null;
  updated_at: string;
  // Joins opcionales
  merchant?: Profile;
}

// ------ CÓDIGO QR -------------------------------------------
export interface QRCode {
  id: string;
  user_id: string;
  qr_token: string;
  is_active: boolean;
  created_at: string;
  // Join opcional
  user?: Profile;
}

// ------ MÉTODO DE PAGO --------------------------------------
export type PaymentMethod = 'cash' | 'transfer';

// ------ RESULTADO DEL DESCUENTO -----------------------------
export type DiscountOutcome =
  | { valid: true; discount_pct: number; reason: string; final_amount: number }
  | { valid: false; reason: string; final_amount: null };

// ------ TRANSACCIÓN DE DESCUENTO ----------------------------
export interface DiscountTransaction {
  id: string;
  scanner_id: string;
  scanned_user_id: string;
  original_amount: number;
  discount_pct: number;
  final_amount: number;
  payment_method: PaymentMethod;
  day_of_week: number; // 0=Dom ... 6=Sáb
  applied_at: string;
  notes: string | null;
  // Joins opcionales
  scanner?: Profile;
  scanned_user?: Profile;
}

// ------ ASSET DE MARKETING ----------------------------------
export type AssetFileType = 'image' | 'video' | 'pdf';

export interface MarketingAsset {
  id: string;
  merchant_id: string;
  title: string | null;
  description: string | null;
  file_url: string;
  file_type: AssetFileType;
  uploaded_by: string | null;
  created_at: string;
  // Joins opcionales
  merchant?: Profile;
  uploader?: Profile;
}

// ------ INPUT DEL ESCÁNER -----------------------------------
export interface ScannerInput {
  scannedToken: string; // Token extraído del QR
  originalAmount: number; // Monto ingresado por el comerciante
  paymentMethod: PaymentMethod; // Método de pago seleccionado
}

// ------ ESTADO DEL ESCÁNER ----------------------------------
export type ScannerState =
  | 'idle'       // Esperando escaneo
  | 'scanning'   // Cámara activa
  | 'processing' // Validando token en backend
  | 'result'     // Mostrando resultado
  | 'error';     // Error inesperado
