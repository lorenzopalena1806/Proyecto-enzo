import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { B2BOffersSection } from '@/components/dashboard/B2BOffersSection';

export const metadata = {
  title: 'Beneficios B2B | Lazoo',
  description: 'Descubrí ofertas exclusivas para comercios de la red.',
};

export default async function B2BOffersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();

  // Fetch active merchants
  const { data: merchants } = await adminClient
    .from('profiles')
    .select('id, business_name, full_name, category, avatar_url, maps_url')
    .eq('role', 'merchant')
    .eq('is_active', true);

  // Fetch active B2B offers (target_role is 'merchant' or 'all')
  const { data: offers } = await adminClient
    .from('merchant_offers')
    .select('*')
    .in('target_role', ['merchant', 'all'])
    .eq('is_active', true)
    // No ver las propias ofertas
    .neq('merchant_id', user.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Beneficios de la Red (B2B)</h1>
        <p className="text-slate-400 mt-1">
          Ofertas exclusivas de otros comercios. Solo tenés que mostrar tu QR de comercio para acceder.
        </p>
      </div>

      <B2BOffersSection merchants={merchants || []} offers={offers || []} />
    </div>
  );
}
