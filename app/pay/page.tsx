export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Store, AlertTriangle, Clock, Tag, Banknote, ArrowLeftRight, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen pay-bg flex flex-col items-center justify-center p-4">
        <div className="glass-card p-8 text-center rounded-3xl max-w-sm w-full">
          <AlertTriangle className="h-12 w-12 text-amber-400 mb-4 mx-auto" />
          <p className="text-white font-semibold">Enlace inválido. Escaneá el QR del local.</p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirectTo=${encodeURIComponent(`/pay?m=${m}`)}`);
  }

  const adminClient = createAdminClient();

  const { data: merchantProfile } = await adminClient
    .from('profiles')
    .select('business_name, full_name, is_active, role')
    .eq('id', m)
    .single();

  if (!merchantProfile || !merchantProfile.is_active || merchantProfile.role !== 'merchant') {
    return (
      <div className="min-h-screen pay-bg flex flex-col items-center justify-center p-4">
        <div className="glass-card p-8 text-center rounded-3xl max-w-sm w-full">
          <AlertTriangle className="h-12 w-12 text-amber-400 mb-4 mx-auto" />
          <p className="text-white font-semibold">Este comercio no es válido.</p>
        </div>
      </div>
    );
  }

  const merchantName = merchantProfile.business_name || merchantProfile.full_name || 'Comercio';

  const { data: clientProfile } = await adminClient
    .from('profiles')
    .select('role, is_active, full_name')
    .eq('id', user.id)
    .single();

  if (!clientProfile || !clientProfile.is_active) {
    return (
      <div className="min-h-screen pay-bg flex flex-col items-center justify-center p-4">
        <div className="glass-card p-8 text-center rounded-3xl max-w-sm w-full">
          <p className="text-red-400 font-semibold">Tu cuenta no está activa.</p>
        </div>
      </div>
    );
  }

  const { data: pendingCharge } = await adminClient
    .from('pending_charges')
    .select('*')
    .eq('merchant_id', m)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Sin cobro activo → pantalla de espera
  if (!pendingCharge) {
    return (
      <div className="min-h-screen pay-bg flex flex-col items-center justify-center p-4">
        <style>{`
          .pay-bg {
            background: radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%);
          }
          .glass-card {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
          }
        `}</style>

        <div className="w-full max-w-sm mx-auto space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl shadow-blue-900/60">
                <Store className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-blue-500/20 blur-xl -z-10" />
            </div>
            <h1 className="text-2xl font-black text-white">{merchantName}</h1>
            <p className="text-blue-400 text-sm font-medium mt-1 tracking-wide">Lazoo</p>
          </div>

          <div className="glass-card rounded-3xl p-8 text-center space-y-5">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Esperando cobro</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                El dueño todavía no preparó ningún cobro.<br />
                <strong className="text-white">Pedile que cargue la oferta</strong> y volvé a escanear.
              </p>
            </div>
            <a
              href={`/pay?m=${m}`}
              className="block w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold transition-all text-center"
            >
              ↻ Actualizar
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Calcular descuento
  const amount = pendingCharge.amount;
  const method = pendingCharge.payment_method;
  let discountPct = 0;
  let finalAmount = amount;
  let offerTitle = pendingCharge.offer_title || null;

  if (pendingCharge.offer_id) {
    const { data: offer } = await adminClient
      .from('merchant_offers')
      .select('discount_pct, final_price, original_price, title')
      .eq('id', pendingCharge.offer_id)
      .single();

    if (offer) {
      discountPct = offer.discount_pct;
      if (offer.final_price && offer.original_price) {
        finalAmount = offer.final_price;
      } else {
        finalAmount = amount - amount * (offer.discount_pct / 100);
      }
      offerTitle = offer.title;
    }
  } else {
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
    <div className="min-h-screen pay-bg p-4 pt-10 pb-10 flex flex-col items-center">
      <style>{`
        .pay-bg {
          background: radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%);
        }
        .glass-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .glass-card-blue {
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(59,130,246,0.2);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 40px rgba(59,130,246,0.08);
        }
        .discount-badge {
          background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1));
          border: 1px solid rgba(16,185,129,0.3);
        }
        .confirm-btn {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          box-shadow: 0 0 40px rgba(37,99,235,0.4), 0 4px 20px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }
        .confirm-btn:hover {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          box-shadow: 0 0 60px rgba(59,130,246,0.5), 0 4px 20px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .confirm-btn:active {
          transform: translateY(0);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-anim { animation: float 3s ease-in-out infinite; }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .glow-pulse { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-sm mx-auto space-y-5">

        {/* ── HEADER COMERCIO ─────────────────────────── */}
        <div className="flex flex-col items-center text-center pt-4">
          <div className="relative mb-4 float-anim">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl">
              <Store className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -inset-3 rounded-3xl bg-blue-500/25 blur-2xl glow-pulse -z-10" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{merchantName}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Lazoo</p>
          </div>
        </div>

        {/* ── OFERTA / BADGE ───────────────────────────── */}
        {offerTitle && (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 mx-4">
            <Tag className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <span className="text-indigo-300 font-semibold text-sm">{offerTitle}</span>
          </div>
        )}

        {/* ── CARD DE RESUMEN ──────────────────────────── */}
        <div className="glass-card-blue rounded-3xl overflow-hidden">

          {/* Precio con descuento — Hero */}
          <div className="px-6 pt-7 pb-5 text-center border-b border-white/[0.06]">
            {discountPct > 0 ? (
              <>
                <p className="text-slate-400 text-sm mb-1 line-through">{formatARS(amount)}</p>
                <p className="text-6xl font-black text-white tracking-tight leading-none">
                  {formatARS(finalAmount)}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full discount-badge">
                  <span className="text-emerald-400 font-bold text-sm">−{discountPct}%</span>
                  <span className="text-emerald-400/70 text-xs">ahorrás {formatARS(saving)}</span>
                </div>
              </>
            ) : (
              <p className="text-6xl font-black text-white tracking-tight">{formatARS(finalAmount)}</p>
            )}
          </div>

          {/* Detalles */}
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2">
                {method === 'cash'
                  ? <Banknote className="h-4 w-4 text-slate-500" />
                  : <ArrowLeftRight className="h-4 w-4 text-slate-500" />}
                Método de pago
              </span>
              <span className="text-white text-sm font-semibold">
                {method === 'cash' ? '💵 Efectivo' : '🔄 Transferencia'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Precio original</span>
              <span className={`text-sm font-medium ${discountPct > 0 ? 'text-slate-500 line-through' : 'text-white'}`}>
                {formatARS(amount)}
              </span>
            </div>
          </div>
        </div>

        {/* ── CLIENTE + CONFIRMAR ──────────────────────── */}
        <div className="space-y-3">
          <p className="text-center text-slate-500 text-xs">
            Confirmando como{' '}
            <span className="text-slate-300 font-medium">{clientProfile.full_name || user.email}</span>
          </p>

          <ClientConfirmForm
            chargeId={pendingCharge.id}
            merchantId={m}
            merchantName={merchantName}
            clientName={clientProfile.full_name || user.email || 'Cliente'}
            amount={amount}
            finalAmount={finalAmount}
            discountPct={discountPct}
            paymentMethod={method}
            offerId={pendingCharge.offer_id || undefined}
            offerTitle={offerTitle || undefined}
          />
        </div>

      </div>
    </div>
  );
}
