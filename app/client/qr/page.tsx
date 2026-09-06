import { ClientBottomNav } from '@/components/client/ClientBottomNav';
export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { User, Sparkles, Clock, Scan, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { DiscoverSection } from '@/components/client/DiscoverSection';
import { ShareButton } from '@/components/shared/ShareButton';
import { OnboardingTutorial } from '@/components/client/OnboardingTutorial';

export default async function ClientQRPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();

  // Obtener perfil y QR en PARALELO
  const [{ data: profile }, { data: initialQrData }] = await Promise.all([
    adminClient.from('profiles').select('full_name, is_active, has_seen_tutorial').eq('id', user.id).single(),
    adminClient.from('qr_codes').select('qr_token').eq('user_id', user.id).single(),
  ]);

  if (profile && profile.is_active === false) {
    redirect('/suspended');
  }

  let qrData = initialQrData;

  // Self-healing: si el usuario no tiene QR (por fallos anteriores), se lo creamos en el momento.
  if (!qrData) {
    const token = crypto.randomUUID();
    const { data: newQr } = await adminClient
      .from('qr_codes')
      .insert({ user_id: user.id, qr_token: token })
      .select('qr_token')
      .single();
    
    if (newQr) {
      qrData = newQr;
    } else {
      return (
        <div className="min-h-screen bg-[#060D1A] flex flex-col items-center justify-center p-4">
          <p className="text-white text-center">
            Hubo un error al generar tu QR. Por favor intentá de nuevo más tarde.<br/><br/>
            <span className="text-slate-400 text-sm">
              Actualmente estás logueado como: <strong className="text-blue-400">{user.email}</strong>
            </span>
          </p>
          <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center space-y-3">
            <LogoutButton />
          </div>
        </div>
      );
    }
  }


  // 1. Fetch active offers from active merchants
  const { data: offers } = await adminClient
    .from('merchant_offers')
    .select(`
      *,
      merchant:profiles!inner (
        business_name,
        full_name,
        is_active
      )
    `)
    .eq('is_active', true)
    .eq('merchant.is_active', true)
    .in('target_role', ['client', 'all'])
    .order('created_at', { ascending: false });

  // Filtrar ofertas por día válido y stock (stock logic usually handled here or in client, but let's do day filter)
  const argDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
  const todayString = argDate.getDay().toString();

  const activeOffers = (offers || []).filter((offer: any) => {
    // Si la oferta tiene un límite de stock y ya se agotó, no mostrarla (opcional, pero buena práctica)
    if (offer.stock_limit && offer.used_count >= offer.stock_limit) return false;
    
    // Si tiene días válidos configurados (array no vacío), debe incluir el día de hoy
    if (offer.valid_days && Array.isArray(offer.valid_days) && offer.valid_days.length > 0) {
      if (!offer.valid_days.includes(todayString)) return false;
    }
    
    return true;
  });

  // 2. Fetch this client's transaction history
  const { data: clientHistory } = await adminClient
    .from('discount_transactions')
    .select(`
      *,
      scanner:profiles!scanner_id(business_name, full_name),
      offer:merchant_offers(title)
    `)
    .eq('scanned_user_id', user.id)
    .order('applied_at', { ascending: false });

  // Calcular ahorro total histórico
  const totalSaved = (clientHistory || []).reduce((acc: number, tx: any) => {
    if (tx.status !== 'cancelled') {
      return acc + ((tx.original_amount || 0) - (tx.final_amount || 0));
    }
    return acc;
  }, 0);

  const displayHistory = clientHistory?.slice(0, 20) || [];

  // 3. Fetch Locales Adheridos (active merchants)
  const { data: merchantsData } = await adminClient
    .from('profiles')
    .select('id, business_name, avatar_url, maps_url, category, is_featured, address, latitude, longitude, plan_type, created_at')
    .eq('role', 'merchant')
    .eq('is_active', true);
    
  // Sort: PRO first, then featured, then created_at
  const merchants = (merchantsData || []).sort((a, b) => {
    if (a.plan_type === 'pro' && b.plan_type !== 'pro') return -1;
    if (a.plan_type !== 'pro' && b.plan_type === 'pro') return 1;
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 4. Fetch Favorites for current user
  const { data: favoritesData } = await adminClient
    .from('favorites')
    .select('merchant_id')
    .eq('client_id', user.id);
  const initialFavorites = favoritesData?.map((f: any) => f.merchant_id) || [];

  return (
    <div className="min-h-screen app-bg flex flex-col font-sans">
      <OnboardingTutorial userId={user.id} hasSeen={profile?.has_seen_tutorial || false} />
      <style>{`
        .app-bg {
          background: radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%);
        }
        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .glass-card-blue {
          background: rgba(59, 130, 246, 0.05);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(59,130,246,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 40px rgba(59,130,246,0.05);
        }
        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          box-shadow: 0 0 20px rgba(37,99,235,0.3), 0 4px 10px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          box-shadow: 0 0 30px rgba(59,130,246,0.4), 0 4px 15px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .scan-btn {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          box-shadow: 0 0 30px rgba(217,70,239,0.3), 0 4px 15px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .scan-btn:hover {
          box-shadow: 0 0 40px rgba(217,70,239,0.4), 0 4px 15px rgba(0,0,0,0.3);
          transform: translateY(-2px);
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .glow-pulse { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>
      
      {/* Background ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="px-4 py-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Lazoo" className="h-7 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <div id="tour-client-share"><ShareButton className="text-xs text-blue-400 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg font-semibold" /></div>
          <a
            href="https://wa.me/5493512388658"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all mr-2"
            title="Soporte (Máx 48hs)"
          >
            <span className="text-sm">💬</span>
            Soporte
          </a>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 space-y-8 max-w-lg mx-auto w-full pt-8 pb-24 relative z-10">
        
        {/* Sección: Bienvenida */}
        <section className="space-y-4">
          <div className="text-center space-y-1 mb-2">
            {totalSaved > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Ahorraste ${totalSaved.toLocaleString('es-AR')}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Club de Beneficios
              </div>
            )}
            <h1 className="text-2xl font-black text-white tracking-tight">Hola, {profile?.full_name || 'Cliente'}</h1>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Descubrí los mejores locales y ofertas cerca tuyo.
            </p>
          </div>
        </section>


        <DiscoverSection 
          merchants={merchants || []} 
          offers={activeOffers} 
          initialFavorites={initialFavorites} 
        />

        {/* Sección: Mis Descuentos Usados */}
        

      </main>

      {/* Floating Bottom Navigation Bar */}
      <ClientBottomNav />
    </div>
  );
}
