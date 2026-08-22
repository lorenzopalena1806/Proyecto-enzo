import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { QrCode, ScanLine, ImageIcon, TrendingUp, ArrowRight, AlertTriangle, Star, ShieldCheck, Briefcase } from 'lucide-react';
import { PushManager } from '@/components/dashboard/PushManager';

export const metadata = {
  title: 'Panel Principal | Lazoo',
  description: 'Tu panel de control en Lazoo.',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/auth/login');

  // Obtener estadísticas del comerciante
  const { count: totalTransactions } = await adminClient
    .from('discount_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('scanner_id', user.id);

  const { count: totalAssets } = await adminClient
    .from('marketing_assets')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', user.id);

  const { data: recentTransactions } = await adminClient
    .from('discount_transactions')
    .select('*, scanned_user:profiles!scanned_user_id(full_name, business_name, role)')
    .eq('scanner_id', user.id)
    .order('applied_at', { ascending: false })
    .limit(5);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const isDiscountDay = dayOfWeek >= 1 && dayOfWeek <= 4;

  // Calcular promedio de calificaciones
  const { data: ratedTransactions } = await adminClient
    .from('discount_transactions')
    .select('rating')
    .eq('scanner_id', user.id)
    .not('rating', 'is', null);

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
        flex items-center gap-3 rounded-xl p-4 border
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Escaneos totales"
          value={String(totalTransactions ?? 0)}
          Icon={ScanLine}
          color="violet"
        />
        <StatCard
          label="Materiales"
          value={String(totalAssets ?? 0)}
          Icon={ImageIcon}
          color="blue"
        />
        <StatCard
          label="Suscripción"
          value="Activa"
          Icon={TrendingUp}
          color="emerald"
        />
        <div className="rounded-xl border p-4 space-y-2 bg-amber-950/40 border-amber-800 text-amber-400">
          <Star className="h-5 w-5 opacity-70" />
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-white">{averageRating > 0 ? averageRating : '-'}</p>
            {averageRating > 0 && <span className="text-xs opacity-70">/ 5</span>}
          </div>
          <p className="text-xs opacity-70">{totalRatings} opiniones</p>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickLink
          href="/dashboard/qr"
          title="Mi Código QR"
          description="Ver y descargar tu QR"
          Icon={QrCode}
        />
        <QuickLink
          href="/dashboard/scanner"
          title="Escáner (Caja)"
          description="Cobrar desde acá"
          Icon={ScanLine}
        />
        <QuickLink
          href="/dashboard/employee"
          title="Modo Empleado"
          description="Acceso con PIN"
          Icon={ShieldCheck}
        />
        <QuickLink
          href="/dashboard/b2b"
          title="Beneficios B2B"
          description="Ofertas exclusivas para vos"
          Icon={Briefcase}
        />
      </div>

      {/* Últimas transacciones */}
      {recentTransactions && recentTransactions.length > 0 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 space-y-4">
          <h2 className="text-white font-semibold">Últimos escaneos</h2>
          <div className="space-y-2">
            {recentTransactions.map((tx: any) => {
              const su = tx.scanned_user as { full_name?: string; business_name?: string; role?: string } | null;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      {su?.business_name ?? su?.full_name ?? 'Usuario'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {new Date(tx.applied_at).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Argentina/Buenos_Aires',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-sm font-bold">
                      −{tx.discount_pct}%
                    </p>
                    <p className="text-slate-400 text-xs">
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
  color: 'violet' | 'blue' | 'emerald';
  className?: string;
}) {
  const colors = {
    violet: 'bg-violet-950/40 border-violet-800 text-violet-400',
    blue: 'bg-blue-950/40 border-blue-800 text-blue-400',
    emerald: 'bg-emerald-950/40 border-emerald-800 text-emerald-400',
  };

  return (
    <div className={`rounded-xl border p-4 space-y-2 ${colors[color]} ${className}`}>
      <Icon className="h-5 w-5 opacity-70" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs opacity-70">{label}</p>
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
      className="group flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-4 hover:border-violet-600/60 hover:bg-slate-800 transition-all duration-200"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-900/60 border border-violet-800 group-hover:bg-violet-700 transition-colors">
        <Icon className="h-5 w-5 text-violet-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium group-hover:text-violet-200 transition-colors">{title}</p>
        <p className="text-slate-500 text-sm truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
