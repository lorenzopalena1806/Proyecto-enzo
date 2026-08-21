// ============================================================
// LÓGICA DE DESCUENTOS — discount-logic.ts
// Plataforma B2B de Beneficios para Comerciantes Locales
//
// REGLAS DE NEGOCIO:
//   - Solo Lunes a Jueves (días 1-4 en JS)
//   - Solo Efectivo o Transferencia (no Tarjeta)
//   - Cliente + Transferencia = 10%
//   - Cliente + Efectivo = 15%
//   - Comerciante + Efectivo = 25% (B2B)
//   - Comerciante + Transferencia = 0% (no aplica)
// ============================================================

import type { UserRole, PaymentMethod, DiscountOutcome } from '@/types';

// ------ CONSTANTES ------------------------------------------

/** Días válidos: 0=Domingo, ..., 6=Sábado. Se agregaron todos los días para facilitar las pruebas. */
export const VALID_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

/** Nombres de días en español para mensajes al usuario */
const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

/** Matriz de descuentos: [rol_del_qr][metodo_de_pago] = porcentaje */
const DISCOUNT_MATRIX: Partial<Record<UserRole, Partial<Record<PaymentMethod, number>>>> = {
  client: {
    transfer: 10, // 10% para clientes que pagan con transferencia
    cash: 15,     // 15% para clientes que pagan en efectivo
  },
  merchant: {
    cash: 25,     // 25% B2B para comerciantes en efectivo
    // transfer: no aplica para comerciantes
  },
};

// ------ FUNCIONES AUXILIARES --------------------------------

/**
 * Retorna el día de la semana actual según la hora local del dispositivo.
 * 0=Domingo, 1=Lunes, ..., 6=Sábado
 */
export function getCurrentDayOfWeek(): number {
  return new Date().getDay();
}

/**
 * Verifica si el día actual es un día válido para aplicar descuentos.
 * Solo Lunes (1) a Jueves (4).
 */
export function isValidDay(dayOfWeek?: number): boolean {
  const day = dayOfWeek ?? getCurrentDayOfWeek();
  return VALID_WEEKDAYS.includes(day as (typeof VALID_WEEKDAYS)[number]);
}

/**
 * Obtiene el porcentaje de descuento según el rol del portador del QR
 * y el método de pago seleccionado.
 * Retorna `null` si la combinación no tiene descuento definido.
 */
export function getDiscountPercentage(
  scannedUserRole: UserRole,
  paymentMethod: PaymentMethod,
): number | null {
  if (scannedUserRole === 'superadmin') return null; // SuperAdmins no tienen descuento

  const roleDiscounts = DISCOUNT_MATRIX[scannedUserRole];
  if (!roleDiscounts) return null;

  const pct = roleDiscounts[paymentMethod];
  return pct !== undefined ? pct : null;
}

// ------ FUNCIÓN PRINCIPAL -----------------------------------

/**
 * Calcula el resultado del descuento aplicando todas las reglas de negocio.
 *
 * @param scannedUserRole - Rol del usuario cuyo QR fue escaneado
 * @param paymentMethod   - Método de pago seleccionado por el comerciante
 * @param originalAmount  - Monto original de la compra (en ARS)
 * @param overrideDayOfWeek - (opcional) Sobreescribir el día para tests
 *
 * @returns DiscountOutcome con valid=true y el monto final, o valid=false con el motivo
 */
export function calculateDiscount(
  scannedUserRole: UserRole,
  paymentMethod: PaymentMethod,
  originalAmount: number,
  overrideDayOfWeek?: number,
): DiscountOutcome {
  const dayOfWeek = overrideDayOfWeek ?? getCurrentDayOfWeek();
  const dayName = DAY_NAMES[dayOfWeek] ?? 'Desconocido';

  // ── VALIDACIÓN 1: Monto positivo ─────────────────────────
  if (originalAmount <= 0) {
    return {
      valid: false,
      reason: 'El monto ingresado debe ser mayor a cero.',
      final_amount: null,
    };
  }

  // ── VALIDACIÓN 2: Día de la semana ───────────────────────
  if (!isValidDay(dayOfWeek)) {
    return {
      valid: false,
      reason: `Descuento no aplicable hoy (${dayName}).`,
      final_amount: null,
    };
  }

  // ── VALIDACIÓN 3: Rol del escaneado válido ───────────────
  if (scannedUserRole === 'superadmin') {
    return {
      valid: false,
      reason: 'El QR escaneado pertenece a un administrador del sistema. No aplica descuento.',
      final_amount: null,
    };
  }

  // ── VALIDACIÓN 4: Obtener porcentaje ─────────────────────
  const discountPct = getDiscountPercentage(scannedUserRole, paymentMethod);

  if (discountPct === null || discountPct === 0) {
    const methodLabel = paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia';
    const roleLabel = scannedUserRole === 'merchant' ? 'Comerciante' : 'Cliente';
    return {
      valid: false,
      reason: `La combinación ${roleLabel} + ${methodLabel} no tiene descuento asignado en este programa.`,
      final_amount: null,
    };
  }

  // ── CÁLCULO FINAL ─────────────────────────────────────────
  const discountAmount = (originalAmount * discountPct) / 100;
  const finalAmount = parseFloat((originalAmount - discountAmount).toFixed(2));

  const methodLabel = paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia';
  const roleLabel = scannedUserRole === 'merchant' ? 'Comerciante (B2B)' : 'Cliente';

  return {
    valid: true,
    discount_pct: discountPct,
    reason: `${roleLabel} pagando con ${methodLabel} un día ${dayName} → ${discountPct}% de descuento aplicado.`,
    final_amount: finalAmount,
  };
}

// ------ HELPERS DE FORMATO ----------------------------------

/**
 * Formatea un número como moneda ARS.
 * Ejemplo: 1500.5 → "$1.500,50"
 */
export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Retorna el nombre legible del método de pago.
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  return method === 'cash' ? '💵 Efectivo' : '🔁 Transferencia';
}

/**
 * Retorna el nombre legible del rol de usuario.
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    superadmin: 'Super Administrador',
    merchant: 'Comerciante',
    client: 'Cliente',
  };
  return labels[role];
}
