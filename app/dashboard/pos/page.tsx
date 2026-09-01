export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { POSView } from './POSView';

export const metadata = {
  title: 'Mi QR de Cobro | Lazoo',
};

export default async function POSPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'merchant') redirect('/dashboard');
  
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get('lazoo_active_branch')?.value || null;

  // Traer las ofertas activas del comercio para el selector
  let offersQuery = adminClient
    .from('merchant_offers')
    .select('id, title, discount_pct, original_price, final_price, valid_days, branch_id')
    .eq('merchant_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (activeBranchId) {
    // Solo trae las de esta sucursal, o las globales (is.null)
    offersQuery = offersQuery.or(`branch_id.eq.${activeBranchId},branch_id.is.null`);
  } else {
    // Si ests en Casa Central, idealmente solo quers las globales o de la casa central
    offersQuery = offersQuery.is('branch_id', null);
  }

  const { data: offers } = await offersQuery;

  const argDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
  const todayString = argDate.getDay().toString();

  const activeOffers = (offers || []).filter((offer: any) => {
    if (offer.valid_days && Array.isArray(offer.valid_days) && offer.valid_days.length > 0) {
      if (!offer.valid_days.includes(todayString)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">QR de Cobro</h1>
        <p className="text-slate-400 mt-1">
          Seleccioná la oferta y el monto, tocá <strong className="text-white">Cargar QR</strong> y mostrárselo al cliente.
        </p>
      </div>

      <POSView
        merchantId={user.id}
        branchId={activeBranchId}
        businessName={profile.business_name || profile.full_name}
        offers={activeOffers}
      />
    </div>
  );
}
