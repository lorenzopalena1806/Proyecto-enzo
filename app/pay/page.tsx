export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Store, AlertTriangle, Clock, Tag, Banknote, ArrowLeftRight } from 'lucide-react';
import { formatARS } from '@/lib/discount-logic';
import { ClientConfirmForm } from './ClientConfirmForm';

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const m = typeof resolvedParams.m === 'string' ? resolvedParams.m : null;

  if (!m) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <p className="text-red-400">Enlace inválido. Escaneá el QR del local.</p>
      </div>
    );
  }

  // Requerir autenticación
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirectTo=${encodeURIComponent(`/pay?m=${m}`)}`);
  }

  const adminClient = createAdminClient();

  // 1. Verificar comercio
  const { data: merchantProfile } = await adminClient
    .from('profiles')
    .select('business_name, full_name, is_active, role')
    .eq('id', m)
    .single();

  if (!merchantProfile || !merchantProfile.is_active || merchantProfile.role !== 'merchant') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-amber-400 mb-4" />
        <p className="text-white font-semibold">Este comercio no es válido.</p>
      </div>
    );
  }

  const merchantName = merchantProfile.business_name || merchantProfile.full_name || 'Comercio';

  // 2. Verificar perfil del cliente
  const { data: clientProfile } = await adminClient
    .from('profiles')
    .select('role, is_active, full_name')
    .eq('id', user.id)
    .single();

  if (!clientProfile || !clientProfile.is_active) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <p className="text-red-400">Tu cuenta no está activa.</p>
      </div>
    );
  }

  // 3. Buscar cobro pendiente activo del comercio
  const { data: pendingCharge } = await adminClient
    .from('pending_charges')
    .select('*')
    .eq('merchant_id', m)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 4. Si NO hay cobro activo → pantalla de espera
  if (!pendingCharge) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 pt-16 flex flex-col items-center max-w-md mx-auto">
        <div className="flex flex-col items-center mb-10">
          <div className="h-20 w-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mb-5 shadow-lg">
            <Store className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center leading-tight">
            {merchantName}
          </h1>
          <p className="text-slate-400 text-sm mt-1">RedBeneficios</p>
        </div>

        <div className="w-full rounded-2xl bg-slate-900 border border-amber-800/50 p-8 text-center space-y-4">
          <div className="h-14 w-14 bg-amber-950/50 border border-amber-800 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Esperando cobro</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            El dueño del local todavía no preparó ningún cobro.<br />
            <strong className="text-white">Pedile que cargue la oferta en su pantalla</strong> y después escaneá de nuevo.
          </p>
          <a
            href={`/pay?m=${m}`}
            className="block w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all text-center mt-2"
          >
            Actualizar
          </a>
        </div>
      </div>
    );
  }

  // 5. Calcular descuento
  const amount = pendingCharge.amount;
  const method = pendingCharge.payment_method;

  let discountPct = 0;
  let finalAmount = amount;
  let offerTitle = pendingCharge.offer_title || null;

  if (pendingCharge.offer_id) {
    // Descuento de oferta específica
    const { data: offer } = await adminClient
      .from('merchant_offers')
      .select('discount_pct, final_price, original_price, title')
      .eq('id', pendingCharge.offer_id)
      .single();

    if (offer) {
      discountPct = offer.discount_pct;
      // Si tiene precio fijo, usar ese; si no, calcular %
      if (offer.final_price && offer.original_price) {
        finalAmount = offer.final_price;
      } else {
        finalAmount = amount - amount * (offer.discount_pct / 100);
      }
      offerTitle = offer.title;
    }
  } else {
    // Descuento estándar según rol + método
    const discountMatrix: Record<string, Record<string, number>> = {
      client: { cash: 15, transfer: 10 },
      merchant: { cash: 25, transfer: 0 },
    };
    const rolePcts = discountMatrix[clientProfile.role] || {};
    discountPct = rolePcts[method] || 0;
    finalAmount = amount - amount * (discountPct / 100);
  }

  const saving = amount - finalAmount;

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-12 flex flex-col items-center max-w-md mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-20 w-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-violet-900/50">
          <Store className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center">
          {merchantName}
        </h1>
        <p className="text-violet-400 text-sm font-medium mt-1">RedBeneficios</p>
      </div>

      {/* Card de resumen del cobro */}
      <div className="w-full rounded-2xl bg-slate-900 border border-slate-700 shadow-xl mb-6 overflow-hidden">
        {/* Oferta */}
        {offerTitle && (
          <div className="bg-violet-950/60 border-b border-violet-800/50 p-4 flex items-center gap-3">
            <Tag className="h-5 w-5 text-violet-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Oferta seleccionada</p>
              <p className="text-white font-bold">{offerTitle}</p>
            </div>
          </div>
        )}

        <div className="p-5 space-y-3">
          {/* Método de pago */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              {method === 'cash'
                ? <Banknote className="h-4 w-4" />
                : <ArrowLeftRight className="h-4 w-4" />
              }
              Método de pago
            </span>
            <span className="text-white font-medium">
              {method === 'cash' ? 'Efectivo' : 'Transferencia'}
            </span>
          </div>

          {/* Monto original */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Precio original</span>
            <span className={discountPct > 0 ? 'text-slate-400 line-through' : 'text-white font-semibold'}>
              {formatARS(amount)}
            </span>
          </div>

          {/* Descuento */}
          {discountPct > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-emerald-400">Tu descuento</span>
              <span className="text-emerald-400 font-bold">−{discountPct}% ({formatARS(saving)})</span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-800 mt-2">
            <span className="text-white font-bold text-lg">Total a pagar</span>
            <span className="text-emerald-400 font-black text-3xl">{formatARS(finalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Saludo + botón de confirmar */}
      <div className="w-full space-y-3">
        <p className="text-center text-slate-400 text-sm">
          Confirmando como <span className="text-white font-medium">{clientProfile.full_name || user.email}</span>
        </p>

        <ClientConfirmForm
          chargeId={pendingCharge.id}
          merchantId={m}
          merchantName={merchantName}
          amount={amount}
          finalAmount={finalAmount}
          discountPct={discountPct}
          paymentMethod={method}
          offerId={pendingCharge.offer_id || undefined}
          offerTitle={offerTitle || undefined}
        />
      </div>
    </div>
  );
}
