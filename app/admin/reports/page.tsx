import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AlertOctagon, CheckCircle, Clock, Trash2, Store, User, Phone, Mail } from 'lucide-react';
import { ReportStatusSelect } from './ReportStatusSelect';

export const metadata = {
  title: 'Gestión de Denuncias | Lazoo',
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'superadmin') {
    redirect('/dashboard');
  }

  // Fetch all reports
  const { data: reports, error } = await adminClient
    .from('reports')
    .select(`
      *,
      client:profiles!client_id(full_name, business_name, phone),
      merchant:profiles!merchant_id(full_name, business_name, phone)
    `)
    .order('created_at', { ascending: false });

  // Fetch emails from Auth
  const { data: authData } = await adminClient.auth.admin.listUsers();
  const authUsers = authData?.users || [];

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'refused_discount': return 'Se negó a dar descuento';
      case 'fake_offer': return 'Oferta falsa/engañosa';
      case 'bad_treatment': return 'Mala atención';
      case 'closed': return 'Local cerrado permanente';
      default: return 'Otro motivo';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-red-500" />
          Centro de Denuncias
        </h1>
        <p className="text-slate-400 mt-1">
          Revisa y gestiona los reportes de clientes hacia los comercios.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {(!reports || reports.length === 0) ? (
          <div className="p-8 text-center text-slate-400">
            No hay ninguna denuncia registrada. ¡Todo en orden!
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {reports.map((report: any) => {
              const clientAuth = authUsers.find(u => u.id === report.client_id);
              const merchantAuth = authUsers.find(u => u.id === report.merchant_id);

              return (
              <div key={report.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  
                  {/* Header del reporte */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-red-400 uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                      {getReasonLabel(report.reason)}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.created_at).toLocaleString('es-AR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                    {/* INFO COMERCIO */}
                    <div className="flex flex-col gap-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-1 text-slate-400 font-semibold mb-1">
                        <Store className="w-4 h-4"/> Comercio Denunciado
                      </div>
                      <div className="font-medium text-white text-base">
                        {report.merchant?.business_name || report.merchant?.full_name || 'Desconocido'}
                      </div>
                      <div className="text-slate-300 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {merchantAuth?.email || 'Sin correo'}
                      </div>
                      <div className="text-slate-300 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {report.merchant?.phone || <span className="text-slate-500 italic">Sin teléfono</span>}
                      </div>
                    </div>
                    
                    {/* INFO CLIENTE */}
                    <div className="flex flex-col gap-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-1 text-slate-400 font-semibold mb-1">
                        <User className="w-4 h-4"/> Cliente Denunciante
                      </div>
                      <div className="font-medium text-white text-base">
                        {report.client?.full_name || report.client?.business_name || 'Desconocido'}
                      </div>
                      <div className="text-slate-300 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {clientAuth?.email || <span className="text-slate-500 italic">Sin correo</span>}
                      </div>
                      <div className="text-slate-300 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {report.client?.phone || <span className="text-slate-500 italic">Sin teléfono</span>}
                      </div>
                    </div>
                  </div>

                  {/* Texto de detalles */}
                  {report.details && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mt-2 relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50 rounded-l-xl"></div>
                      <p className="text-sm text-slate-300 italic">"{report.details}"</p>
                    </div>
                  )}

                </div>

                {/* Acciones */}
                <div className="w-full md:w-48 shrink-0 flex items-center justify-end">
                  <ReportStatusSelect reportId={report.id} initialStatus={report.status} />
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
