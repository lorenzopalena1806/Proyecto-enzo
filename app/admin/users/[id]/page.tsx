import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Store, User, ArrowLeft, CheckCircle2, XCircle, Tag, Calendar, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { SuspendUserButton } from '@/components/admin/SuspendUserButton';
import { SubscriptionManager } from '@/components/admin/SubscriptionManager';
import { MaterialManager } from '@/components/admin/MaterialManager';


export const dynamic = 'force-dynamic';

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const adminClient = createAdminClient();
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  // 1. Fetch Profile
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // 2. Fetch Auth Data for email
  const { data: authData } = await adminClient.auth.admin.getUserById(userId);
  const email = authData?.user?.email || 'Sin correo';

  // 3. Fetch specific data depending on role
  let clientScans = [];
  let merchantOffers = [];
  let merchantScans = [];
  
  if (profile.role === 'client') {
    const { data: scans } = await adminClient
      .from('discount_transactions')
      .select('*, scanner:profiles!discount_transactions_scanner_id_fkey(business_name, full_name)')
      .eq('scanned_user_id', userId)
      .order('applied_at', { ascending: false });
    clientScans = scans || [];
  } else if (profile.role === 'merchant') {
    const { data: offers } = await adminClient
      .from('merchant_offers')
      .select('*')
      .eq('merchant_id', userId)
      .order('created_at', { ascending: false });
    merchantOffers = offers || [];

    const { data: scans } = await adminClient
      .from('discount_transactions')
      .select('*, scanned_user:profiles!discount_transactions_scanned_user_id_fkey(full_name)')
      .eq('scanner_id', userId)
      .order('applied_at', { ascending: false });
    merchantScans = scans || [];
  }

  return (
    <div className="space-y-6">
      {/* Header & Volver */}
      <div className="flex flex-col gap-4">
        <Link href="/admin/users" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" />
          Volver a Usuarios
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0 ${
              profile.role === 'merchant' ? 'bg-violet-900/50 text-violet-400' : 'bg-emerald-900/50 text-emerald-400'
            }`}>
              {profile.role === 'merchant' ? <Store className="h-8 w-8" /> : <User className="h-8 w-8" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {profile.role === 'merchant' ? profile.business_name || profile.full_name : profile.full_name || 'Sin nombre'}
              </h1>
              <div className="text-slate-400 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-1 text-sm">
                <span>{email}</span>
                <span className="hidden md:inline">•</span>
                <span className="capitalize">{profile.role}</span>
                <span className="hidden md:inline">•</span>
                <span>Registrado: {new Date(profile.created_at).toLocaleDateString('es-AR')}</span>
              </div>
            </div>
          </div>
          <div>
            <SuspendUserButton userId={profile.id} isActive={profile.is_active} role={profile.role} />
          </div>
        </div>
      </div>

      {/* CLIENT SPECIFIC VIEW */}
      {profile.role === 'client' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mt-8">Historial de Escaneos Realizados</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                    <th className="px-6 py-4 font-medium">Local</th>
                    <th className="px-6 py-4 font-medium">Oferta / Descuento</th>
                    <th className="px-6 py-4 font-medium">Monto Final</th>
                    <th className="px-6 py-4 font-medium text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {clientScans.map((scan: any) => (
                    <tr key={scan.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300">
                        {new Date(scan.applied_at).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {scan.scanner?.business_name || scan.scanner?.full_name || 'Comercio Desconocido'}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {scan.offer_title ? (
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-emerald-400" />
                            {scan.offer_title}
                          </div>
                        ) : (
                          `${scan.discount_pct}% global`
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-emerald-400">
                        ${scan.final_amount.toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {scan.status === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle className="h-3.5 w-3.5" /> Cancelado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {clientScans.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Este cliente aún no ha escaneado en ningún local.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MERCHANT SPECIFIC VIEW */}
      {profile.role === 'merchant' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SubscriptionManager userId={profile.id} expiresAt={profile.subscription_expires_at} />
            <MaterialManager userId={profile.id} currentStatus={profile.material_status} />

          </div>

          {/* Active Offers */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mt-8">Promociones del Comercio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {merchantOffers.map((offer: any) => (
                <div key={offer.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white text-lg">{offer.title}</h3>
                      {offer.is_active ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Activa</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700">Inactiva</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{offer.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-end">
                    <div>
                      {offer.final_price ? (
                        <div>
                          <span className="text-xs text-slate-500 line-through mr-2">${offer.original_price}</span>
                          <span className="text-lg font-bold text-emerald-400">${offer.final_price}</span>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-emerald-400">{offer.discount_pct}% OFF</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Escaneos</div>
                      <div className="font-semibold text-white">{offer.used_count || 0}</div>
                    </div>
                  </div>
                </div>
              ))}
              {merchantOffers.length === 0 && (
                <div className="col-span-full p-8 border border-slate-800 border-dashed rounded-2xl text-center text-slate-500">
                  Este comercio no tiene promociones configuradas.
                </div>
              )}
            </div>
          </div>

          {/* Scan History */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Historial de Escaneos (Cobros)</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Fecha</th>
                      <th className="px-6 py-4 font-medium">Cliente</th>
                      <th className="px-6 py-4 font-medium">Oferta / Descuento</th>
                      <th className="px-6 py-4 font-medium">Monto</th>
                      <th className="px-6 py-4 font-medium text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {merchantScans.map((scan: any) => (
                      <tr key={scan.id} className={`hover:bg-slate-800/30 transition-colors ${scan.status === 'cancelled' ? 'bg-red-950/10' : ''}`}>
                        <td className="px-6 py-4 text-slate-300">
                          {new Date(scan.applied_at).toLocaleString('es-AR')}
                        </td>
                        <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          {scan.client_name || scan.scanned_user?.full_name || 'Cliente'}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {scan.offer_title ? (
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-violet-400" />
                              {scan.offer_title}
                            </div>
                          ) : (
                            `${scan.discount_pct}% global`
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-emerald-400">
                          ${scan.final_amount.toLocaleString('es-AR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {scan.status === 'cancelled' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20" title="Este cobro fue borrado por el comercio">
                              <XCircle className="h-3.5 w-3.5" /> Cancelado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Completado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {merchantScans.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          Este comercio aún no ha realizado cobros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
