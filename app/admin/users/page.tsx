import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import { ShieldAlert } from 'lucide-react';
import AdminUsersTableClient from '@/components/admin/AdminUsersTableClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const adminClient = createAdminClient();

  // 1. Obtener todos los perfiles
  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    return <div className="text-red-400">Error al cargar perfiles: {profilesError.message}</div>;
  }

  // 2. Obtener correos usando la API de Auth de Supabase (requiere Service Role Key)
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error cargando usuarios de auth:", authError);
  }

  const authUsers = authData?.users || [];

  // 3. Obtener transacciones para agrupar ventas y escaneos
  const { data: transactions } = await adminClient
    .from('discount_transactions')
    .select('scanner_id, scanned_user_id, final_amount, original_amount');

  const txs = transactions || [];

  // 4. Unir los datos y enriquecer con métricas
  const enrichedProfiles = (profiles || []).map((profile: any) => {
    const authUser = authUsers.find((u: any) => u.id === profile.id);
    
    let totalSales = 0;
    let totalScans = 0;

    if (profile.role === 'merchant') {
      // Para comercios: buscar donde ellos son el scanner_id
      const merchantTxs = txs.filter(t => t.scanner_id === profile.id);
      totalScans = merchantTxs.length;
      totalSales = merchantTxs.reduce((sum, t) => sum + (t.final_amount || 0), 0);
    } else if (profile.role === 'client') {
      // Para clientes: buscar donde ellos son el scanned_user_id
      const clientTxs = txs.filter(t => t.scanned_user_id === profile.id);
      totalScans = clientTxs.length;
    }

    return {
      ...profile,
      email: authUser?.email || 'Sin correo',
      lastSignIn: authUser?.last_sign_in_at || null,
      total_sales: totalSales,
      total_scans: totalScans
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Registro de Usuarios</h1>
          <p className="text-slate-400 mt-1">Buscá, filtrá y ordená a los comercios y clientes registrados.</p>
        </div>
      </div>

      <AdminUsersTableClient initialUsers={enrichedProfiles} />
      
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3 mt-8">
        <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-amber-400">Privacidad y Seguridad</h4>
          <p className="text-xs text-slate-400 mt-1">Por cuestiones de seguridad, las contraseñas no se muestran ni se guardan en texto plano en la base de datos. Están cifradas por Supabase Auth. Si un usuario pierde acceso, podés restablecer su contraseña desde el panel externo de Supabase.</p>
        </div>
      </div>
    </div>
  );
}
