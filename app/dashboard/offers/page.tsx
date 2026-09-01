import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { OffersManager } from '@/components/dashboard/OffersManager';

export const metadata = {
  title: 'Mis Ofertas | Lazoo',
  description: 'Gestioná los descuentos que ofrecés en la red.',
};

export default async function OffersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch offers for this merchant
  const { data: offers } = await supabase
    .from('merchant_offers')
    .select('*')
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch branches
  const { data: branches } = await supabase
    .from('merchant_branches')
    .select('id, name')
    .eq('merchant_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mis Ofertas</h1>
        <p className="text-slate-400 mt-1">
          Creá descuentos especiales. Estas ofertas aparecerán en la vidriera de los clientes.
        </p>
      </div>

      <OffersManager initialOffers={offers || []} branches={branches || []} />
    </div>
  );
}
