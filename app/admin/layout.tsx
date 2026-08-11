import { createClient } from '@/lib/supabase-server';
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

  const { data: profile, error: profileError } = await supabase
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
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col lg:overflow-auto">
        <div className="lg:hidden h-14 flex-shrink-0" />
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
