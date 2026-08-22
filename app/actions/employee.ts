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
