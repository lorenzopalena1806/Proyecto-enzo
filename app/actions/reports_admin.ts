'use server';

import { createAdminClient, createClient } from '@/lib/supabase-server';

export async function updateReportStatus(reportId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const adminClient = createAdminClient();

  // Verificar que el usuario que intenta hacer esto sea superadmin
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'superadmin') {
    return { success: false, error: 'Permisos insuficientes' };
  }

  const { error } = await adminClient
    .from('reports')
    .update({ status })
    .eq('id', reportId);

  if (error) {
    console.error('Error actualizando reporte:', error);
    return { success: false, error: 'Hubo un error al actualizar el estado' };
  }

  return { success: true };
}
