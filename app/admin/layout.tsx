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
    <div className="flex min-h-screen app-bg text-white">
      <style>{`
        .app-bg {
          background: radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%);
        }
        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .glass-card-blue {
          background: rgba(59, 130, 246, 0.05);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(59,130,246,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 40px rgba(59,130,246,0.05);
        }
        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          box-shadow: 0 0 20px rgba(37,99,235,0.3), 0 4px 10px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          box-shadow: 0 0 30px rgba(59,130,246,0.4), 0 4px 15px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .input-glass {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          transition: all 0.2s ease;
        }
        .input-glass:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
          outline: none;
        }
        .input-glass::placeholder {
          color: rgba(255,255,255,0.3);
        }
      `}</style>
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col lg:overflow-auto relative z-10">
        <div className="lg:hidden h-14 flex-shrink-0" />
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
      
      {/* Background ambient orbs para todo el panel admin */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>
    </div>
  );
}
