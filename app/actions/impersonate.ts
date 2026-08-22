'use server';

import { createAdminClient } from '@/lib/supabase-server';

export async function impersonateMerchant(merchantId: string): Promise<{ link?: string; error?: string }> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: '', // Se llenará abajo
  });

  // Primero buscamos el email del comercio
  const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(merchantId);

  if (userError || !userData?.user?.email) {
    return { error: 'No se pudo encontrar el email del comercio.' };
  }

  // Generamos el magic link para ese email
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: userData.user.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?support_mode=true`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error('Error generando magic link:', linkError);
    return { error: 'No se pudo generar el acceso. Intenta de nuevo.' };
  }

  return { link: linkData.properties.action_link };
}
