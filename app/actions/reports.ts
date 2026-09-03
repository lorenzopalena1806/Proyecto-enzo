'use server';

import { createClient } from '@/lib/supabase-server';

export async function submitReport(merchantId: string, reason: string, details: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para denunciar.' };
  }

  // Insertar en la tabla reports (asumimos que ya creamos la tabla)
  const { error } = await supabase
    .from('reports')
    .insert([
      {
        client_id: user.id,
        merchant_id: merchantId,
        reason,
        details,
        status: 'pending'
      }
    ]);

  if (error) {
    console.error('Error enviando reporte:', error);
    return { success: false, error: 'Hubo un error al enviar tu reporte. Intenta de nuevo.' };
  }

  return { success: true };
}
