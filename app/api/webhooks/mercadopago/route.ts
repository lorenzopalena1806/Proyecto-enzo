import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const type = url.searchParams.get('type');
    const dataId = url.searchParams.get('data.id');

    // MercadoPago envía diferentes notificaciones. 
    // Para suscripciones, nos interesa 'subscription_preapproval'
    // También pueden venir en el body, así que lo leemos si es posible.
    
    let body;
    try {
      body = await request.json();
    } catch(e) {
      body = {};
    }

    // Buscamos el ID de la suscripción (ya sea por query param o en el body)
    const subscriptionId = dataId || body?.data?.id;

    if (!subscriptionId) {
      return NextResponse.json({ status: 'ignored', reason: 'no_id' }, { status: 200 });
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_ACCESS_TOKEN) {
      console.error('Webhook Error: MP_ACCESS_TOKEN no configurado');
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    // Consultar a la API de MP el estado real de esta suscripción
    const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      console.error('Webhook Error: No se pudo consultar la suscripción en MP', subscriptionId);
      return NextResponse.json({ error: 'MP API error' }, { status: 500 });
    }

    const subscriptionData = await response.json();
    const status = subscriptionData.status; // 'authorized', 'pending', 'cancelled'
    const profileId = subscriptionData.external_reference; // Recuperamos el ID del comercio

    if (!profileId) {
      console.error('Webhook Error: La suscripción no tiene external_reference');
      return NextResponse.json({ status: 'ignored', reason: 'no_external_reference' }, { status: 200 });
    }

    const adminClient = createAdminClient();

    // Actualizamos la base de datos
    // Si status es 'authorized', significa que el pago pasó y están activos
    const updateData: any = {
      mp_subscription_status: status,
      mp_subscription_id: subscriptionId
    };

    if (status === 'authorized') {
      // Les damos 31 días de vigencia desde ahora
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + 31);
      updateData.subscription_ends_at = endsAt.toISOString();
      updateData.is_pro = true; // Automáticamente se hacen PRO
    } else if (status === 'cancelled') {
      updateData.is_pro = false; // Se les corta el acceso si cancelan
    }

    await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', profileId);

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook general error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
