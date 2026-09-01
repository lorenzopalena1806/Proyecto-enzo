'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase-server';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazoo.vercel.app';

export async function createSubscription(planType: 'basic' | 'pro') {
  if (!MP_ACCESS_TOKEN) {
    return { error: 'Las credenciales de Mercado Pago no están configuradas.' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  // Definir precio según plan
  const amount = planType === 'basic' ? 55000 : 80000;
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
        payer_email: user.email,
        external_reference: user.id // CLAVE: para saber quién pagó en el webhook
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de MP:', data);
      return { error: 'Error al generar el link de pago.' };
    }

    // Guardar la intención de suscripción en el perfil (como pending)
    const adminClient = createAdminClient();
    await adminClient
      .from('profiles')
      .update({
        plan_type: planType,
        mp_subscription_status: 'pending',
        mp_subscription_id: data.id // Guardamos el ID de suscripción que devuelve MP
      })
      .eq('id', user.id);

    return { init_point: data.init_point };

  } catch (err: any) {
    console.error('Error MP:', err);
    return { error: 'Error interno del servidor.' };
  }
}
