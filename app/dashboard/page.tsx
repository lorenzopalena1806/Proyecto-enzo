import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { QrCode, ScanLine, ImageIcon, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          ¡Hola, {profile.business_name ?? profile.full_name ?? 'Comerciante'}! 👋
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          {today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Alerta de día */}
      <div className={`
        flex items-center gap-3 rounded-xl p-4 border shadow-sm
        ${isDiscountDay
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
        }
      `}>
        <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${isDiscountDay ? 'text-emerald-600' : 'text-amber-600'}`} />
        <p className="text-sm font-semibold">
          {isDiscountDay
            ? '✅ Hoy los descuentos están ACTIVOS. ¡Podés escanear QRs!'
            : '⚠️ Hoy los descuentos están INACTIVOS (solo Lunes a Jueves).'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Escaneos realizados"
          value={String(totalTransactions ?? 0)}
          Icon={ScanLine}
          color="violet"
        />
        <StatCard
          label="Materiales de marketing"
          value={String(totalAssets ?? 0)}
          Icon={ImageIcon}
          color="blue"
        />
        <StatCard
          label="Estado suscripción"
          value="Activa"
          Icon={TrendingUp}
          color="emerald"
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Accesos rápidos */}
      <div className="grid md:grid-cols-2 gap-4">
        <QuickLink
          href="/dashboard/qr"
          title="Mi Código QR"
          description="Ver y descargar tu QR único"
          Icon={QrCode}
        />
        <QuickLink
          href="/dashboard/scanner"
          title="Escáner"
          description="Escanear QR y aplicar descuentos"
          Icon={ScanLine}
        />
      </div>

      {/* Últimas transacciones */}
      {recentTransactions && recentTransactions.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
          <h2 className="text-slate-900 font-bold">Últimos escaneos</h2>
          <div className="space-y-2">
            {recentTransactions.map((tx: any) => {
              const su = tx.scanned_user as { full_name?: string; business_name?: string; role?: string } | null;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-slate-900 text-sm font-bold">
                      {su?.business_name ?? su?.full_name ?? 'Usuario'}
                    </p>
                    <p className="text-slate-500 text-xs font-medium">
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
                    <p className="text-emerald-600 text-sm font-black">
                      −{tx.discount_pct}%
                    </p>
                    <p className="text-slate-500 text-xs font-semibold">
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
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  return (
    <div className={`rounded-xl border p-4 space-y-2 shadow-sm ${colors[color]} ${className}`}>
      <Icon className="h-5 w-5 opacity-80" />
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-semibold opacity-80">{label}</p>
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
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-blue-100 transition-colors">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 font-bold group-hover:text-blue-700 transition-colors">{title}</p>
        <p className="text-slate-500 text-sm font-medium truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
