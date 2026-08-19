import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { calculateDiscount, formatARS, getPaymentMethodLabel } from '@/lib/discount-logic';
import { ClientPayForm } from './ClientPayForm';
import type { PaymentMethod } from '@/types';
import { ClientInputAmountForm } from './ClientInputAmountForm';
import { Store, AlertTriangle } from 'lucide-react';

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const m = typeof resolvedParams.m === 'string' ? resolvedParams.m : null;
  const a = typeof resolvedParams.a === 'string' ? resolvedParams.a : null;
  const method = typeof resolvedParams.method === 'string' ? (resolvedParams.method as PaymentMethod) : null;
  const offerId = typeof resolvedParams.offer === 'string' ? resolvedParams.offer : null;

  if (!m) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <p className="text-red-400">Enlace de pago inválido.</p>
      </div>
    );
  }

  const amount = a ? parseFloat(a) : 0;

  // Requerir autenticación
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    let returnUrl = `/pay?m=${m}&a=${a}&method=${method}`;
    if (offerId) returnUrl += `&offer=${offerId}`;
    redirect(`/auth/login?redirectTo=${encodeURIComponent(returnUrl)}`);
  }

  const adminClient = createAdminClient();

  // 1. Obtener perfil del usuario que está pagando
  const { data: clientUser } = await adminClient
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!clientUser || !clientUser.is_active) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <p className="text-red-400">Tu cuenta no está activa o es inválida.</p>
      </div>
    );
  }

  // 2. Obtener datos del comercio
  const { data: merchantUser } = await adminClient
    .from('profiles')
    .select('business_name, full_name, is_active')
    .eq('id', m)
    .single();

  if (!merchantUser || !merchantUser.is_active) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <p className="text-red-400">El comercio escaneado no es válido.</p>
      </div>
    );
  }

  const merchantName = merchantUser.business_name || merchantUser.full_name || 'Comercio';

  // 3. Fetch offer if offerId is present
  let offerDetails = null;
  if (offerId) {
    const { data: offer } = await adminClient
      .from('merchant_offers')
      .select('*')
      .eq('id', offerId)
      .eq('merchant_id', m)
      .single();
    offerDetails = offer;
  }

  // 4. Si falta el monto o el método de pago, mostramos el formulario para que el cliente lo ingrese
  if (!a || !method) {
    const initialAmount = offerDetails?.original_price ? offerDetails.original_price.toString() : null;
    
    return (
      <div className="min-h-screen bg-slate-950 p-4 pt-12 flex flex-col items-center max-w-md mx-auto">
        <div className="w-full flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-violet-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-violet-900/50">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center leading-tight">
            Estás pagando en <br/> <span className="text-violet-400">{merchantName}</span>
          </h1>
          {offerDetails?.title && (
            <p className="text-emerald-400 font-medium mt-2">Oferta seleccionada: {offerDetails.title}</p>
          )}
        </div>
        <ClientInputAmountForm 
          merchantId={m} 
          merchantName={merchantName} 
          offerId={offerId}
          initialAmount={initialAmount}
          urlAmount={a}
        />
      </div>
    );
  }

  // 5. Calcular el descuento simulado para mostrar en la UI
  let outcome = { valid: false, discount_pct: 0, final_amount: amount, reason: '', offerTitle: '' };

  if (offerId && offerDetails) {
    if (!offerDetails.is_active) {
      outcome = { valid: false, discount_pct: 0, final_amount: amount, reason: 'La oferta ya no está disponible.', offerTitle: '' };
    } else if (offerDetails.target_role !== 'all' && offerDetails.target_role !== clientUser.role) {
      outcome = { valid: false, discount_pct: 0, final_amount: amount, reason: `Esta oferta es exclusiva para ${offerDetails.target_role === 'client' ? 'Clientes' : 'Comercios'}.`, offerTitle: '' };
    } else {
      const isFixedPrice = !!offerDetails.final_price && !!offerDetails.original_price;
      const computedFinalAmount = isFixedPrice ? offerDetails.final_price : amount - (amount * (offerDetails.discount_pct / 100));

      outcome = { 
        valid: true, 
        discount_pct: offerDetails.discount_pct, 
        final_amount: computedFinalAmount, 
        reason: '',
        offerTitle: offerDetails.title
      };
    }
  } else if (offerId && !offerDetails) {
    outcome = { valid: false, discount_pct: 0, final_amount: amount, reason: 'La oferta no existe.', offerTitle: '' };
  } else {
    const defaultOutcome = calculateDiscount(clientUser.role, method, amount);
    outcome = { 
      valid: defaultOutcome.valid,
      discount_pct: defaultOutcome.valid ? defaultOutcome.discount_pct : 0,
      final_amount: defaultOutcome.valid ? defaultOutcome.final_amount : amount,
      reason: defaultOutcome.valid ? '' : defaultOutcome.reason,
      offerTitle: '' 
    };
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-12 flex flex-col items-center max-w-md mx-auto">
      <div className="w-full flex flex-col items-center mb-8">
        <div className="h-16 w-16 bg-violet-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-violet-900/50">
          <Store className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center leading-tight">
          Estás pagando en <br/> <span className="text-violet-400">{merchantName}</span>
        </h1>
      </div>

      <div className="w-full rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-xl mb-6 space-y-4">
        {outcome.offerTitle && (
          <div className="bg-violet-950/40 border border-violet-800 p-3 rounded-xl mb-4 text-center">
            <span className="text-violet-300 font-semibold text-sm uppercase tracking-wider block mb-1">Oferta Especial</span>
            <span className="text-white font-bold text-lg">{outcome.offerTitle}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <span className="text-slate-400 font-medium">Método de pago</span>
          <span className="text-white font-medium">{getPaymentMethodLabel(method)}</span>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <span className="text-slate-400 font-medium">Monto original</span>
          <span className="text-white text-lg">{formatARS(amount)}</span>
        </div>

        {outcome.valid ? (
          <>
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Descuento aplicado</span>
              <span className="text-emerald-400 font-bold text-lg">−{outcome.discount_pct}%</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-white font-semibold text-lg">Total a abonar</span>
              <span className="text-emerald-400 font-bold text-3xl">{formatARS(outcome.final_amount)}</span>
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-amber-950/30 border border-amber-800 p-4 flex gap-3 mt-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-400">Sin descuento aplicable</p>
              <p className="text-xs text-amber-500/80">{outcome.reason}</p>
            </div>
          </div>
        )}
      </div>

      {outcome.valid && (
        <ClientPayForm 
          merchantId={m} 
          amount={amount} 
          method={method} 
          merchantName={merchantName}
          offerId={offerId || undefined}
        />
      )}
    </div>
  );
}
