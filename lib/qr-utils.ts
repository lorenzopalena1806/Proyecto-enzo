// ============================================================
// QR UTILITIES — qr-utils.ts
// Generación y parseo de tokens de QR seguros
// ============================================================

import type { UserRole } from '@/types';

// ------ TIPOS -----------------------------------------------

export interface QRPayload {
  userId: string;
  role: UserRole;
  token: string; // El token único del qr_codes.qr_token
  version: number;
}

// ------ GENERACIÓN ------------------------------------------

/**
 * Genera el string que irá dentro del código QR.
 * Formato: JSON codificado en base64 para ser compacto.
 *
 * NOTA: En producción, este token debería ser un JWT firmado
 * con la clave privada de Supabase. Para el MVP usamos base64.
 */
export function encodeQRPayload(payload: QRPayload): string {
  const json = JSON.stringify(payload);
  return btoa(encodeURIComponent(json));
}

/**
 * Decodifica el string del QR y retorna el payload.
 * Retorna `null` si el QR no es válido o está malformado.
 */
export function decodeQRPayload(qrString: string): QRPayload | null {
  try {
    const json = decodeURIComponent(atob(qrString));
    const parsed = JSON.parse(json) as QRPayload;

    // Validación mínima del shape
    if (
      !parsed.userId ||
      !parsed.role ||
      !parsed.token ||
      !['superadmin', 'merchant', 'client'].includes(parsed.role)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Genera un token único aleatorio para almacenar en la tabla qr_codes.
 * En el servidor, usar crypto.randomUUID() directamente.
 */
export function generateQRToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para entornos sin crypto.randomUUID
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Construye la URL completa que puede usarse en el QR para
 * redirigir al escáner de la web app automáticamente.
 * Útil si se escanea con una cámara externa (Instagram, etc.).
 */
export function buildQRUrl(payload: QRPayload, baseUrl: string): string {
  const encoded = encodeQRPayload(payload);
  return `${baseUrl}/scan?qr=${encoded}`;
}

// ------ VALIDACIÓN ------------------------------------------

/**
 * Valida si un string escaneado parece ser un QR de nuestra plataforma.
 */
export function isValidPlatformQR(scannedString: string): boolean {
  const payload = decodeQRPayload(scannedString);
  return payload !== null;
}
