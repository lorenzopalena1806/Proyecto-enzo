'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazoo.vercel.app';

export async function createSubscription(planType: 'basic' | 'pro', userId: string) {
  if (!MP_ACCESS_TOKEN) {
    return { error: 'Las credenciales de Mercado Pago no están configuradas.' };
  }

  const supabase = await createClient();

  if (!userId) return { error: 'No autorizado. Por favor iniciá sesión nuevamente.' };

  const adminClient = createAdminClient();
  
  // Buscamos el email real de la bóveda de autenticación (auth.users)
  const { data: authUser } = await adminClient.auth.admin.getUserById(userId);
  
  // Usamos el mail oficial, o un fallback fantasma si por algún motivo no existe
  const userEmail = authUser?.user?.email || `comercio-${userId.substring(0, 8)}@lazoo.com.ar`;

  // Obtener precios dinámicos
  const { data: settingsData } = await adminClient.from('app_settings').select('*');
  const getSetting = (key: string, defaultValue: number) => {
    const row = settingsData?.find(s => s.key === key);
    return row ? row.value.amount : defaultValue;
  };
  const basicPrice = getSetting('pricing_basic', 55000);
  const proPrice = getSetting('pricing_pro', 80000);

  const amount = planType === 'basic' ? basicPrice : proPrice;
  const reason = planType === 'basic' ? 'Lazoo Plan Básico' : 'Lazoo Plan PRO';

  try {
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: reason,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: 'ARS'
        },
        back_url: `${SITE_URL}/dashboard`,
        payer_email: userEmail,
        external_reference: userId // CLAVE: para saber quién pagó en el webhook
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de MP:', data);
      return { error: `MP Error: ${JSON.stringify(data)}` };
    }

    // Guardar la intención de suscripción en el perfil (como pending)
    await adminClient
      .from('profiles')
      .update({
        plan_type: planType,
        mp_subscription_status: 'pending',
        mp_subscription_id: data.id // Guardamos el ID de suscripción que devuelve MP
      })
      .eq('id', userId);

    return { init_point: data.init_point };

  } catch (err: any) {
    console.error('Error MP:', err);
    return { error: 'Error interno del servidor.' };
  }
}
