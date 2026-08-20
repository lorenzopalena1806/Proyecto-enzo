export const dynamic = 'force-dynamic';

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

  // Traer las ofertas activas del comercio para el selector
  const { data: offers } = await adminClient
    .from('merchant_offers')
    .select('id, title, discount_pct, original_price, final_price')
    .eq('merchant_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">QR de Cobro</h1>
        <p className="text-slate-400 mt-1">
          Seleccioná la oferta y el monto, tocá <strong className="text-white">Cargar QR</strong> y mostráselo al cliente.
        </p>
      </div>

      <POSView
        merchantId={user.id}
        businessName={profile.business_name || profile.full_name}
        offers={offers || []}
      />
    </div>
  );
}
