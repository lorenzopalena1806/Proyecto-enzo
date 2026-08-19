'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase';
import { Store, BellRing, CheckCircle2, DollarSign } from 'lucide-react';
import { formatARS } from '@/lib/discount-logic';

export function POSView({ merchantId, businessName }: { merchantId: string, businessName: string }) {
  const supabase = createClient();
  const [recentTx, setRecentTx] = useState<any | null>(null);

  // Generar URL estática del QR apuntando a /pay?m=MERCHANT_ID
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${baseUrl}/pay?m=${merchantId}`;

  // Escuchar cobros en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discount_transactions',
          filter: `scanner_id=eq.${merchantId}`,
        },
        (payload) => {
          const newTx = payload.new;
          setRecentTx(newTx);
          
          // Reproducir sonido (opcional, si el navegador lo permite)
          try {
            const audio = new Audio('/success.mp3');
            audio.play().catch(e => console.log('Audio autoplay blocked', e));
          } catch(e) {}
          
          // Ocultar la notificación después de 15 segundos
          setTimeout(() => {
            setRecentTx(null);
          }, 15000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchantId, supabase]);

  return (
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* ── ALERTA DE COBRO RECIENTE ───────────────────────────────── */}
      {recentTx && (
        <div className="rounded-2xl border border-emerald-500 bg-emerald-950/80 backdrop-blur-md p-6 text-center space-y-4 shadow-2xl shadow-emerald-900/50 animate-fade-in fixed top-4 right-4 left-4 md:static z-50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 border border-emerald-400">
            <BellRing className="h-8 w-8 text-emerald-400 animate-bounce" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-1">¡Nuevo Pago Recibido!</h3>
            <p className="text-emerald-300">El cliente acaba de confirmar.</p>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 text-left border border-emerald-800/50">
            <div className="flex justify-between text-sm mb-2 text-slate-400">
              <span>Monto total:</span>
              <span>{formatARS(recentTx.original_amount)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2 text-slate-400">
              <span>Descuento aplicado:</span>
              <span className="text-emerald-400">-{recentTx.discount_pct}%</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-slate-700/50">
              <span className="text-white">A cobrar:</span>
              <span className="text-emerald-400">{formatARS(recentTx.final_amount)}</span>
            </div>
          </div>
          
          <button
            onClick={() => setRecentTx(null)}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
          >
            Aceptar y Ocultar
          </button>
        </div>
      )}

      {/* ── QR PRINCIPAL ───────────────────────────────── */}
      <div className="rounded-3xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-8 flex flex-col items-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-violet-600/20 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="h-16 w-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-900/50">
            <Store className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-white text-center mb-1">{businessName}</h2>
          <p className="text-violet-400 font-semibold uppercase tracking-wider text-sm mb-8">Escaneá para pagar</p>
          
          <div className="bg-white p-6 rounded-3xl shadow-2xl">
            <QRCodeSVG value={qrUrl} size={260} level="M" />
          </div>
          
          <p className="mt-8 text-center text-slate-400 text-sm max-w-xs">
            El cliente escanea este QR con su cámara, ingresa el monto de su compra y vos recibís la alerta acá mismo.
          </p>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={() => window.print()}
          className="py-4 rounded-xl border border-slate-600 hover:border-slate-400 bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
        >
          Imprimir este QR
        </button>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(qrUrl);
            alert('¡Enlace de cobro copiado!');
          }}
          className="py-4 rounded-xl border border-violet-600 hover:border-violet-400 bg-violet-900/30 hover:bg-violet-800/40 text-violet-300 font-semibold transition-all"
        >
          Copiar enlace web
        </button>
      </div>
    </div>
  );
}
