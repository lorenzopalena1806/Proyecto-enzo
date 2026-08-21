import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Usamos Admin Client para saltarnos cualquier problema de bucles infinitos RLS
  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/auth/login');
  }

  // Solo superadmins pueden acceder al panel admin
  if (profile.role !== 'superadmin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col lg:overflow-auto relative z-10">
        <div className="lg:hidden h-14 flex-shrink-0" />
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
      
      {/* Background ambient orbs para todo el panel admin */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-100/30 blur-[120px]" />
      </div>
    </div>
  );
}
