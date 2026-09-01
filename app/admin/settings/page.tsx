import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';
import { PricingForm } from './PricingForm';

export const metadata = {
  title: 'Configuración | Admin Lazoo',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'superadmin') redirect('/dashboard');

  // Obtener precios actuales
  const { data: settingsData } = await adminClient.from('app_settings').select('*');
  
  const getSetting = (key: string, defaultValue: number) => {
    const row = settingsData?.find(s => s.key === key);
    return row ? row.value.amount : defaultValue;
  };

  const basicPrice = getSetting('pricing_basic', 55000);
  const proPrice = getSetting('pricing_pro', 80000);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-blue-400" /> Configuraciones Globales
        </h1>
        <p className="text-slate-400 mt-1">Administrá los precios y parámetros de toda la plataforma Lazoo.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Precios de Suscripciones Mensuales</h2>
        <PricingForm currentBasic={basicPrice} currentPro={proPrice} />
      </div>
    </div>
  );
}
