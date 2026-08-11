import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Obtener usuario actual
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Obtener perfil con rol
  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/auth/login');
  }

  // Solo merchants (y superadmins) pueden acceder al dashboard
  if (profile.role === 'client') {
    redirect('/client/qr');
  }

  // Verificar suscripción activa para merchants
  if (profile.role === 'merchant') {
    const { data: subscriptions } = await adminClient
      .from('subscriptions')
      .select('status')
      .eq('merchant_id', user.id)
      .eq('status', 'active')
      .limit(1);

    if (!subscriptions || subscriptions.length === 0) {
      redirect('/subscription-required');
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar profile={profile} />
      {/* Spacer para mobile header */}
      <div className="flex-1 flex flex-col lg:overflow-auto">
        <div className="lg:hidden h-14 flex-shrink-0" />
        <main className="flex-1 p-4 lg:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
