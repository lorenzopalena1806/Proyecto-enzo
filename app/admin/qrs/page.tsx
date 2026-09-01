import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { QrCode, Store, MapPin } from 'lucide-react';
import { AdminQRManager } from '@/components/admin/AdminQRManager';

export const metadata = {
  title: 'QRs Físicos | Lazoo Admin',
};

export default async function AdminQRsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();

  // Verificar rol de superadmin
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'superadmin') {
    redirect('/dashboard');
  }

  // Traer todos los comercios activos
  const { data: merchants } = await adminClient
    .from('profiles')
    .select('id, business_name, full_name, address')
    .eq('role', 'merchant')
    .eq('is_active', true)
    .order('business_name', { ascending: true });

  // Traer todas las sucursales
  const { data: branches } = await adminClient
    .from('merchant_branches')
    .select('id, merchant_id, name, address')
    .eq('is_active', true);

  // Armar la estructura
  const structuredData = merchants?.map(merchant => {
    return {
      id: merchant.id,
      name: merchant.business_name || merchant.full_name || 'Sin Nombre',
      address: merchant.address,
      branches: branches?.filter(b => b.merchant_id === merchant.id) || []
    };
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <QrCode className="h-8 w-8 text-violet-400" />
          Descarga de QRs Físicos
        </h1>
        <p className="text-slate-400 mt-1">
          Acá podés generar y descargar los carteles QR oficiales de todos los comercios y sus sucursales para mandarlos a imprimir.
        </p>
      </div>

      <AdminQRManager merchants={structuredData} />
    </div>
  );
}
