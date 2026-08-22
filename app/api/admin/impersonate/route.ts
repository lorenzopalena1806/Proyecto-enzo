import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar que quien llama es un superadmin
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (callerProfile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // 2. Obtener el merchant a impersonar
    const { merchantId } = await req.json();
    if (!merchantId) {
      return NextResponse.json({ error: 'merchantId requerido' }, { status: 400 });
    }

    const { data: merchantUser, error: userError } = await adminClient.auth.admin.getUserById(merchantId);

    if (userError || !merchantUser?.user?.email) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 });
    }

    // 3. Generar magic link con redirectTo usando el host de la request actual
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const siteUrl = `${protocol}://${host}`;

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: merchantUser.user.email,
      options: {
        redirectTo: `${siteUrl}/auth/verify?next=/dashboard?support_mode=true`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Error generando magic link:', linkError);
      return NextResponse.json({ error: 'No se pudo generar el acceso' }, { status: 500 });
    }

    return NextResponse.json({ link: linkData.properties.action_link });

  } catch (err) {
    console.error('Impersonate error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
