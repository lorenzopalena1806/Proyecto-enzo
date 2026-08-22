'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

// 1. Dueño configura el PIN
export async function setEmployeePinServer(pin: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, reason: 'No estás autenticado.' };
  }

  if (pin.length !== 4 || !/^\d+$/.test(pin)) {
    return { success: false, reason: 'El PIN debe ser de 4 dígitos numéricos.' };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('profiles')
    .update({ employee_pin: pin })
    .eq('id', user.id);

  if (error) {
    return { success: false, reason: 'Error al guardar el PIN.' };
  }

  return { success: true };
}

// 2. Dueño obtiene su PIN actual
export async function getEmployeePinServer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('profiles')
    .select('employee_pin')
    .eq('id', user.id)
    .single();

  return data?.employee_pin || null;
}

// 3. Empleado verifica el PIN para iniciar sesión
export async function verifyEmployeePinServer(merchantId: string, pin: string) {
  const adminClient = createAdminClient();
  
  const { data } = await adminClient
    .from('profiles')
    .select('employee_pin, is_active')
    .eq('id', merchantId)
    .single();

  if (!data || !data.is_active || !data.employee_pin) {
    return { success: false, reason: 'Comercio inválido o sin PIN configurado.' };
  }

  if (data.employee_pin !== pin) {
    return { success: false, reason: 'PIN incorrecto.' };
  }

  // Establecer cookie de sesión de empleado (dura 12 horas)
  const cookieStore = await cookies();
  cookieStore.set(`emp_session_${merchantId}`, 'active', {
    maxAge: 43200, // 12 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return { success: true };
}

// 4. Empleado verifica si hay una transacción reciente (Polling)
export async function checkRecentTransactionServer(merchantId: string, originalAmount: number, afterTimestamp: number) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get(`emp_session_${merchantId}`);
  
  if (!hasSession) {
    return { success: false, reason: 'Sesión expirada' };
  }

  const adminClient = createAdminClient();
  
  // Convert timestamp to ISO
  const afterDate = new Date(afterTimestamp).toISOString();

  const { data } = await adminClient
    .from('discount_transactions')
    .select('id, final_amount, original_amount')
    .eq('scanner_id', merchantId)
    .eq('original_amount', originalAmount)
    .gte('created_at', afterDate)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data) {
    return { success: true, transactionId: data.id, finalAmount: data.final_amount };
  }

  return { success: false, reason: 'No transaction yet' };
}

// 5. Empleado crea un cobro pendiente (habilita QR estático)
export async function employeeCreatePendingCharge(merchantId: string, formData: FormData) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`emp_session_${merchantId}`)) {
    return { success: false, error: 'Sesión expirada' };
  }

  const adminClient = createAdminClient();

  // Cancelar cualquier cobro activo previo
  await adminClient
    .from('pending_charges')
    .update({ status: 'cancelled' })
    .eq('merchant_id', merchantId)
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
      merchant_id: merchantId,
      offer_id: offer_id || null,
      offer_title: offer_title || null,
      amount,
      payment_method,
      status: 'active',
    })
    .select('id, expires_at')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, chargeId: data.id, expiresAt: data.expires_at };
}

// 6. Empleado cancela un cobro pendiente
export async function employeeCancelPendingCharge(merchantId: string, chargeId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`emp_session_${merchantId}`)) return { success: false };

  const adminClient = createAdminClient();
  await adminClient
    .from('pending_charges')
    .update({ status: 'cancelled' })
    .eq('id', chargeId)
    .eq('merchant_id', merchantId);

  return { success: true };
}

// 7. Polling para chequear si el cliente ya pagó el cobro pendiente
export async function employeeCheckPendingChargeStatus(merchantId: string, chargeId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`emp_session_${merchantId}`)) return { success: false, error: 'expired' };

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('pending_charges')
    .select('status, final_amount_paid, discount_applied_pct, completed_by_name')
    .eq('id', chargeId)
    .eq('merchant_id', merchantId)
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

// 8. Empleado procesa cobro manual por short code
export async function employeeCompletePendingChargeWithCode(merchantId: string, chargeId: string, shortCode: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`emp_session_${merchantId}`)) {
    return { success: false, error: 'Sesión expirada' };
  }

  const adminClient = createAdminClient();
  
  // 1. Get the pending charge
  const { data: charge } = await adminClient
    .from('pending_charges')
    .select('*')
    .eq('id', chargeId)
    .eq('merchant_id', merchantId)
    .eq('status', 'active')
    .single();

  if (!charge) {
    return { success: false, error: 'Cobro activo no encontrado.' };
  }

  // 2. Find client by short code
  const { data: qrRecords } = await adminClient
    .from('qr_codes')
    .select('user_id, is_active, profiles:user_id(full_name)')
    .ilike('qr_token', `${shortCode}%`)
    .limit(1);

  if (!qrRecords || qrRecords.length === 0) {
    return { success: false, error: 'Código de cliente no encontrado.' };
  }

  const clientData = qrRecords[0];
  if (!clientData.is_active) {
    return { success: false, error: 'El código de este cliente está desactivado.' };
  }

  // 3. Process payment
  const { processPaymentByShortCodeServer } = await import('./charge');
  const paymentRes = await processPaymentByShortCodeServer(
    merchantId, 
    charge.amount, 
    charge.payment_method as any, 
    shortCode, 
    charge.offer_id || undefined
  );

  if (!paymentRes.success) {
    return { success: false, error: paymentRes.reason || 'Error al procesar el pago.' };
  }

  // 4. Update the pending charge to completed to trigger the real-time UI/polling
  const clientProfile = clientData.profiles as any;
  const { error: updateError } = await adminClient
    .from('pending_charges')
    .update({
      status: 'completed',
      completed_by_name: clientProfile?.full_name || 'Cliente',
      final_amount_paid: (paymentRes as any).finalAmount,
      discount_applied_pct: (paymentRes as any).discountPct,
    })
    .eq('id', chargeId);

  if (updateError) {
    console.error('Error updating pending charge status:', updateError);
    return { success: false, error: 'Pago registrado, pero no se pudo actualizar la pantalla.' };
  }

  return { success: true };
}

