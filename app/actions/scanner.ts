'use server';

import { createAdminClient, createClient } from '@/lib/supabase-server';
import { decodeQRPayload } from '@/lib/qr-utils';
import { calculateDiscount } from '@/lib/discount-logic';
import type { PaymentMethod, DiscountOutcome, Profile } from '@/types';

export interface ProcessScanResult {
  outcome: DiscountOutcome;
  scannedUser: Profile | null;
  originalAmount: number;
  paymentMethod: PaymentMethod;
}

export async function processQRScanServer(qrText: string, amount: number, method: PaymentMethod): Promise<ProcessScanResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No autorizado para escanear');
  }

  const adminClient = createAdminClient();
  const payload = decodeQRPayload(qrText);

  if (!payload) {
    return {
      outcome: {
        valid: false,
        reason: 'El código QR escaneado no es válido o no pertenece a esta plataforma.',
        final_amount: null,
      },
      scannedUser: null,
      originalAmount: amount,
      paymentMethod: method,
    };
  }

  // Verificar QR token
  const { data: qrRecord } = await adminClient
    .from('qr_codes')
    .select('is_active, user_id')
    .eq('qr_token', payload.token)
    .single();

  if (!qrRecord) {
    return {
      outcome: {
        valid: false,
        reason: 'Este código QR no fue encontrado en el sistema.',
        final_amount: null,
      },
      scannedUser: null,
      originalAmount: amount,
      paymentMethod: method,
    };
  }

  if (!qrRecord.is_active) {
    return {
      outcome: {
        valid: false,
        reason: 'Este código QR está desactivado. El usuario debe contactar al administrador.',
        final_amount: null,
      },
      scannedUser: null,
      originalAmount: amount,
      paymentMethod: method,
    };
  }

  // Obtener perfil
  const { data: scannedUser } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', payload.userId)
    .single();

  if (!scannedUser) {
    return {
      outcome: {
        valid: false,
        reason: 'No se pudo obtener el perfil del usuario asociado a este QR.',
        final_amount: null,
      },
      scannedUser: null,
      originalAmount: amount,
      paymentMethod: method,
    };
  }

  if (!scannedUser.is_active) {
    return {
      outcome: {
        valid: false,
        reason: `El usuario "${scannedUser.full_name ?? 'Desconocido'}" no está activo en la plataforma.`,
        final_amount: null,
      },
      scannedUser: scannedUser as Profile,
      originalAmount: amount,
      paymentMethod: method,
    };
  }

  // Verificar suscripción si es merchant
  if (scannedUser.role === 'merchant') {
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('status, expires_at')
      .eq('merchant_id', scannedUser.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return {
        outcome: {
          valid: false,
          reason: `El comercio "${scannedUser.business_name ?? scannedUser.full_name}" no tiene una suscripción activa en la red.`,
          final_amount: null,
        },
        scannedUser: scannedUser as Profile,
        originalAmount: amount,
        paymentMethod: method,
      };
    }

    if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
      return {
        outcome: {
          valid: false,
          reason: `La suscripción del comercio "${scannedUser.business_name}" ha expirado.`,
          final_amount: null,
        },
        scannedUser: scannedUser as Profile,
        originalAmount: amount,
        paymentMethod: method,
      };
    }
  }

  const outcome = calculateDiscount(scannedUser.role, method, amount);

  if (outcome.valid) {
    await adminClient.from('discount_transactions').insert({
      scanner_id: user.id,
      scanned_user_id: scannedUser.id,
      original_amount: amount,
      discount_pct: outcome.discount_pct,
      final_amount: outcome.final_amount,
      payment_method: method,
      qr_token_used: payload.token,
    });
  }

  return {
    outcome,
    scannedUser: scannedUser as Profile,
    originalAmount: amount,
    paymentMethod: method,
  };
}
