import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { QrCode, ScanLine, ImageIcon, TrendingUp, ArrowRight, AlertTriangle, Star, ShieldCheck, Briefcase, Printer, Heart, Package } from 'lucide-react';
import { PushManager } from '@/components/dashboard/PushManager';
import { MerchantChart } from '@/components/dashboard/MerchantChart';
import { MaterialRequestButton } from '@/components/dashboard/MaterialRequestButton';
import { LazooInsights } from '@/components/dashboard/LazooInsights';

export const metadata = {
  title: 'Panel Principal | Lazoo',
  description: 'Tu panel de control en Lazoo.',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0,0,0,0);

  // Obtener perfil y estadísticas en PARALELO para máxima velocidad de carga
  const [
    { data: profile },
    { count: totalTransactions },
    { data: recentTransactions },
    { data: ratedTransactions },
    { count: totalFavorites }
  ] = await Promise.all([
    adminClient.from('profiles').select('*').eq('id', user.id).single(),
    adminClient.from('discount_transactions').select('*', { count: 'exact', head: true }).eq('scanner_id', user.id),
    adminClient.from('discount_transactions').select('*, scanned_user:profiles!scanned_user_id(full_name, business_name, role)').eq('scanner_id', user.id).order('applied_at', { ascending: false }).limit(5),
    adminClient.from('discount_transactions').select('rating').eq('scanner_id', user.id).not('rating', 'is', null).limit(100),
    adminClient.from('favorites').select('*', { count: 'exact', head: true }).eq('merchant_id', user.id)
  ]);

  if (!profile) redirect('/auth/login');

  const today = new Date();
  const dayOfWeek = today.getDay();
  const isDiscountDay = dayOfWeek >= 1 && dayOfWeek <= 4;

  let averageRating = 0;
  let totalRatings = 0;
  if (ratedTransactions && ratedTransactions.length > 0) {
    totalRatings = ratedTransactions.length;
    const sum = ratedTransactions.reduce((acc: number, tx: any) => acc + (tx.rating || 0), 0);
    averageRating = Number((sum / totalRatings).toFixed(1));
  }



  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          ¡Hola, {profile.business_name ?? profile.full_name ?? 'Comerciante'}! 👋
        </h1>
        <p className="text-slate-400 mt-1">
          {today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Gestor de Notificaciones Push */}
      <PushManager />

      {/* Alerta de día */}
      <div className={`
        flex items-center gap-3 rounded-xl p-4 border mb-4
        ${isDiscountDay
          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
          : 'bg-amber-950/40 border-amber-800 text-amber-300'
        }
      `}>
        <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${isDiscountDay ? 'text-emerald-400' : 'text-amber-400'}`} />
        <p className="text-sm font-medium">
          {isDiscountDay
            ? '✅ Hoy los descuentos están ACTIVOS. ¡Podés escanear QRs!'
            : '⚠️ Hoy los descuentos están INACTIVOS (solo Lunes a Jueves).'}
        </p>
      </div>

      {/* Alerta de Suscripción */}
      {(() => {
        if (!profile.subscription_expires_at) return null;
        const expires = new Date(profile.subscription_expires_at);
        const diffDays = Math.ceil((expires.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
          return (
            <div className="flex items-center gap-3 rounded-xl p-4 border bg-red-950/40 border-red-800 text-red-300">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
              <p className="text-sm font-medium">
                ❌ Tu suscripción está VENCIDA. Por favor, comunícate con soporte para renovarla.
              </p>
            </div>
          );
        } else if (diffDays <= 5) {
          return (
            <div className="flex items-center gap-3 rounded-xl p-4 border bg-amber-950/40 border-amber-800 text-amber-300">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-400" />
              <p className="text-sm font-medium">
                ⚠️ Tu suscripción vence en {diffDays} {diffDays === 1 ? 'día' : 'días'}.
              </p>
            </div>
          );
        }
        return null;
      })()}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <StatCard
          label="Escaneos totales"
          value={String(totalTransactions ?? 0)}
          Icon={ScanLine}
          color="violet"
        />
        <StatCard
          label="Favoritos"
          value={String(totalFavorites ?? 0)}
          Icon={Heart}
          color="blue"
        />
        <StatCard
          label="Suscripción"
          value={
            !profile.subscription_expires_at 
              ? 'Demo'
              : (new Date(profile.subscription_expires_at) < today ? 'Vencida' : 'Activa')
          }
          Icon={TrendingUp}
          color={
            !profile.subscription_expires_at 
              ? 'blue'
              : (new Date(profile.subscription_expires_at) < today ? 'red' : 'emerald')
          }
        />
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
          <div className="relative z-10 flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Opiniones</p>
            <div className="bg-amber-500/20 p-1.5 rounded-lg border border-amber-500/30">
              <Star className="h-4 w-4 text-amber-300" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-black text-white tracking-tight">{averageRating > 0 ? averageRating : '-'}</p>
              {averageRating > 0 && <span className="text-sm font-medium text-slate-400">/ 5</span>}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">{totalRatings} calificaciones</p>
          </div>
        </div>
      </div>

      <LazooInsights merchantId={user.id} />

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <QuickLink
          href="/dashboard/pos"
          title="Cobrar (POS)"
          description="Cargar QR de cobro"
          Icon={ScanLine}
        />
        <QuickLink
          href="/dashboard/print-qr"
          title="Imprimir QR"
          description="Cartel para mostrador"
          Icon={Printer}
        />
        <QuickLink
          href="/dashboard/qr"
          title="Beneficios B2B"
          description="Comprar en otros locales"
          Icon={QrCode}
        />
        <QuickLink
          href="/dashboard/employee"
          title="Modo Empleado"
          description="Acceso con PIN"
          Icon={ShieldCheck}
        />
        <QuickLink
          href="/dashboard/offers"
          title="Mis Ofertas"
          description="Crear y editar promos"
          Icon={Briefcase}
        />
      </div>

      {/* Últimas transacciones */}
      {recentTransactions && recentTransactions.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 relative z-10 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Últimos Escaneos
            </h2>
            <Link href="/dashboard/history" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">
              Ver Historial
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx: any) => {
              const su = tx.scanned_user as { full_name?: string; business_name?: string; role?: string } | null;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10 flex-shrink-0">
                      <ScanLine className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold group-hover:text-blue-300 transition-colors">
                        {su?.business_name ?? su?.full_name ?? 'Usuario Anónimo'}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {new Date(tx.applied_at).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-sm font-black tracking-tight flex items-center justify-end gap-1">
                      <span className="text-emerald-500/50 text-xs">Ahorró</span>
                      {tx.discount_pct}%
                    </p>
                    <p className="text-slate-300 text-xs font-medium bg-black/20 px-2 py-0.5 rounded-md mt-1 inline-block border border-white/5">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(tx.final_amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  Icon,
  color,
  className = '',
}: {
  label: string;
  value: string;
  Icon: React.ElementType;
  color: 'violet' | 'blue' | 'emerald' | 'red';
  className?: string;
}) {
  const colors = {
    violet: 'bg-violet-500/5 group-hover:bg-violet-500/10 border-violet-500/20 text-violet-400 icon-violet',
    blue: 'bg-blue-500/5 group-hover:bg-blue-500/10 border-blue-500/20 text-blue-400 icon-blue',
    emerald: 'bg-emerald-500/5 group-hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400 icon-emerald',
    red: 'bg-red-500/5 group-hover:bg-red-500/10 border-red-500/20 text-red-400 icon-red',
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'violet': return 'text-violet-300 bg-violet-500/20 border-violet-500/30';
      case 'blue': return 'text-blue-300 bg-blue-500/20 border-blue-500/30';
      case 'emerald': return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30';
      case 'red': return 'text-red-300 bg-red-500/20 border-red-500/30';
      default: return 'text-slate-300 bg-slate-500/20 border-slate-500/30';
    }
  };

  return (
    <div className={`glass-panel rounded-2xl p-4 flex flex-col justify-between shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)] relative overflow-hidden group ${colors[color]} ${className}`}>
      <div className="relative z-10 flex items-center justify-between mb-2">
        <p className={`text-xs font-semibold uppercase tracking-wider ${color === 'violet' ? 'text-violet-400' : color === 'blue' ? 'text-blue-400' : color === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>
          {label}
        </p>
        <div className={`p-1.5 rounded-lg border ${getIconColor(color)}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="relative z-10 mt-1">
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  Icon,
}: {
  href: string;
  title: string;
  description: string;
  Icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="glass-panel group flex items-center gap-4 rounded-2xl p-4 hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/5 group-hover:opacity-100 opacity-0 transition-opacity" />
      <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
        <Icon className="h-5 w-5 text-slate-300 group-hover:text-blue-300 transition-colors" />
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <p className="text-white font-bold group-hover:text-blue-200 transition-colors text-sm">{title}</p>
        <p className="text-slate-400 text-xs truncate font-medium mt-0.5">{description}</p>
      </div>
      <div className="relative z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
