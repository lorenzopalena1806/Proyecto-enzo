'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';

export async function toggleFavoriteServer(merchantId: string, isFavorited: boolean) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No estás autenticado');

    const adminClient = createAdminClient();

    if (isFavorited) {
      // Remover de favoritos
      const { error } = await adminClient
        .from('favorites')
        .delete()
        .eq('client_id', user.id)
        .eq('merchant_id', merchantId);
        
      if (error) throw error;
    } else {
      // Agregar a favoritos
      const { error } = await adminClient
        .from('favorites')
        .insert({
          client_id: user.id,
          merchant_id: merchantId,
        });
        
      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return { success: false, error: error.message };
  }
}
