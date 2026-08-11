import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { MarketingGallery } from '@/components/dashboard/MarketingGallery';

export const metadata = {
  title: 'Marketing | RedBeneficios',
  description: 'Descargá tus materiales de marketing para redes sociales.',
};

export default async function MarketingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();

  const { data: assets, error } = await adminClient
    .from('marketing_assets')
    .select('*')
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Materiales de Marketing</h1>
        <p className="text-slate-400 mt-1">
          Descargá tus carruseles e imágenes para compartir en redes sociales
        </p>
      </div>

      <MarketingGallery assets={assets ?? []} />
    </div>
  );
}
