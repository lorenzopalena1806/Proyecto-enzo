'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// CRUD Empleados
export async function createEmployeeServer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, reason: 'No autorizado' };

  const name = formData.get('name') as string;
  const pin = formData.get('pin') as string;
  const branch_id = formData.get('branch_id') as string;

  if (!name || !pin || pin.length < 4 || !branch_id) {
    return { success: false, reason: 'Datos inválidos. PIN debe tener al menos 4 dígitos.' };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('merchant_employees')
    .insert({
      merchant_id: user.id,
      branch_id,
      name,
      pin
    });

  if (error) return { success: false, reason: error.message };
  
  revalidatePath('/dashboard/employee');
  return { success: true };
}

export async function deleteEmployeeServer(employeeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const adminClient = createAdminClient();
  await adminClient
    .from('merchant_employees')
    .delete()
    .eq('id', employeeId)
    .eq('merchant_id', user.id);

  revalidatePath('/dashboard/employee');
  return { success: true };
}

// Auth de Empleado
export async function verifyEmployeePinServer(employeeId: string, pin: string) {
  const adminClient = createAdminClient();
  
  const { data } = await adminClient
    .from('merchant_employees')
    .select('id, merchant_id, branch_id, pin')
    .eq('id', employeeId)
    .single();

  if (!data || data.pin !== pin) {
    return { success: false, reason: 'PIN incorrecto o empleado no encontrado.' };
  }

  // Seteamos la cookie con el ID del empleado
  const cookieStore = await cookies();
  cookieStore.set(`lazoo_emp_${employeeId}`, 'active', {
    maxAge: 43200, // 12 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return { success: true, merchantId: data.merchant_id };
}

export async function employeeLogoutServer(employeeId: string) {
  const cookieStore = await cookies();
  cookieStore.delete(`lazoo_emp_${employeeId}`);
  return { success: true };
}

// Acciones POS del Empleado (requieren la cookie)
export async function employeeCreatePendingCharge(employeeId: string, formData: FormData) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`lazoo_emp_${employeeId}`)) {
    return { success: false, error: 'Sesión expirada' };
  }

  const adminClient = createAdminClient();
  
  // Obtenemos los datos del empleado para saber merchant_id y branch_id
  const { data: emp } = await adminClient
    .from('merchant_employees')
    .select('merchant_id, branch_id')
    .eq('id', employeeId)
    .single();
    
  if (!emp) return { success: false, error: 'Empleado inválido' };

  // Cancelamos cobros previos de ESTA sucursal específica
  await adminClient
    .from('pending_charges')
    .update({ status: 'cancelled' })
    .eq('merchant_id', emp.merchant_id)
    .eq('branch_id', emp.branch_id)
    .eq('status', 'active');

  const offer_id = formData.get('offer_id') as string | null;
  const amount = parseFloat(formData.get('amount') as string);
  const payment_method = formData.get('payment_method') as string;
  const offer_title = formData.get('offer_title') as string | null;

  if (!amount || amount <= 0 || !payment_method) {
    return { success: false, error: 'Datos inválidos.' };
  }

  const { data, error } = await adminClient
    .from('pending_charges')
    .insert({
      merchant_id: emp.merchant_id,
      branch_id: emp.branch_id,
      offer_id: offer_id || null,
      offer_title: offer_title || null,
      amount,
      payment_method,
      status: 'active',
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    .select('id, expires_at')
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, chargeId: data.id, expiresAt: data.expires_at };
}

export async function employeeCancelPendingCharge(employeeId: string, chargeId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`lazoo_emp_${employeeId}`)) return { success: false };

  const adminClient = createAdminClient();
  await adminClient
    .from('pending_charges')
    .update({ status: 'cancelled' })
    .eq('id', chargeId);

  return { success: true };
}

export async function employeeCheckPendingChargeStatus(employeeId: string, chargeId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`lazoo_emp_${employeeId}`)) return { success: false, error: 'expired' };

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('pending_charges')
    .select('status, final_amount_paid, discount_applied_pct, completed_by_name')
    .eq('id', chargeId)
    .single();

  if (data && data.status === 'completed') {
    return {
      success: true,
      completed: true,
      final_amount: data.final_amount_paid,
      discount_pct: data.discount_applied_pct,
      client_name: data.completed_by_name,
    };
  }

  return { success: true, completed: false };
}
export async function employeeCompletePendingChargeWithCode(employeeId: string, chargeId: string, shortCode: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`lazoo_emp_${employeeId}`)) return { success: false, error: 'Sesión expirada' };

  const adminClient = createAdminClient();
  const { data: emp } = await adminClient.from('merchant_employees').select('merchant_id').eq('id', employeeId).single();
  if (!emp) return { success: false, error: 'Cajero inválido' };

  const { data: charge } = await adminClient
    .from('pending_charges')
    .select('*')
    .eq('id', chargeId)
    .eq('merchant_id', emp.merchant_id)
    .eq('status', 'active')
    .single();

  if (!charge) return { success: false, error: 'Cobro activo no encontrado.' };

  const { data: qrRecords } = await adminClient
    .from('qr_codes')
    .select('user_id, is_active, profiles:user_id(full_name)')
    .ilike('qr_token', `${shortCode}%`)
    .limit(1);

  if (!qrRecords || qrRecords.length === 0) return { success: false, error: 'Código de cliente no encontrado.' };
  if (!qrRecords[0].is_active) return { success: false, error: 'Código desactivado.' };

  const { processPaymentByShortCodeServer } = await import('./charge');
  const paymentRes = await processPaymentByShortCodeServer(emp.merchant_id, charge.amount, charge.payment_method as any, shortCode, charge.offer_id || undefined);

  if (!paymentRes.success) return { success: false, error: paymentRes.reason || 'Error al procesar el pago.' };

  const clientProfile = qrRecords[0].profiles as any;
  await adminClient.from('pending_charges').update({
    status: 'completed',
    completed_by_name: clientProfile?.full_name || 'Cliente',
    final_amount_paid: (paymentRes as any).finalAmount,
    discount_applied_pct: (paymentRes as any).discountPct,
  }).eq('id', chargeId);

  return { success: true };
}
