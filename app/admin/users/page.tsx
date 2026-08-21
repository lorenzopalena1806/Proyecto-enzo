import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import { Store, User, Mail, Calendar, ShieldAlert } from 'lucide-react';
import { SuspendUserButton } from '@/components/admin/SuspendUserButton';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const adminClient = createAdminClient();

  // 1. Obtener todos los perfiles
  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    return <div className="text-red-400">Error al cargar perfiles: {profilesError.message}</div>;
  }

  // 2. Obtener correos usando la API de Auth de Supabase (requiere Service Role Key)
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error cargando usuarios de auth:", authError);
    // Podemos continuar mostrando perfiles aunque falle Auth, pero sin email
  }

  const authUsers = authData?.users || [];

  // 3. Unir los datos
  const enrichedProfiles = (profiles || []).map((profile: any) => {
    const authUser = authUsers.find((u: any) => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email || 'Sin correo',
      lastSignIn: authUser?.last_sign_in_at || null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Registro de Usuarios</h1>
          <p className="text-slate-400 mt-1">Acá podés ver quién se registra, su rol y su correo.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Usuario / Email</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Negocio / Detalles</th>
                <th className="px-6 py-4 font-medium text-right">Fecha de Registro</th>
                <th className="px-6 py-4 font-medium text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {enrichedProfiles.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        user.role === 'merchant' ? 'bg-violet-900/50 text-violet-400' : 
                        user.role === 'superadmin' ? 'bg-amber-900/50 text-amber-400' :
                        'bg-emerald-900/50 text-emerald-400'
                      }`}>
                        {user.role === 'merchant' ? <Store className="h-5 w-5" /> : 
                         user.role === 'superadmin' ? <ShieldAlert className="h-5 w-5" /> :
                         <User className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{user.full_name || 'Sin nombre'}</div>
                        <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                      user.role === 'merchant' ? 'bg-violet-950 text-violet-400 border border-violet-800/50' : 
                      user.role === 'superadmin' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    }`}>
                      {user.role === 'merchant' ? 'Comercio' : 
                       user.role === 'superadmin' ? 'Superadmin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'merchant' ? (
                      <div>
                        <div className="text-white font-medium">{user.business_name || 'Sin nombre'}</div>
                        {user.phone && <div className="text-slate-400 text-xs mt-0.5">Tel: {user.phone}</div>}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    <div className="flex items-center justify-end gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.created_at).toLocaleDateString('es-AR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <SuspendUserButton userId={user.id} isActive={user.is_active} role={user.role} />
                  </td>
                </tr>
              ))}
              
              {enrichedProfiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No hay usuarios registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-amber-400">Privacidad y Seguridad</h4>
          <p className="text-xs text-slate-400 mt-1">Por cuestiones de seguridad, las contraseñas no se muestran ni se guardan en texto plano en la base de datos. Están cifradas por Supabase Auth. Si un usuario pierde acceso, podés restablecer su contraseña desde el panel externo de Supabase.</p>
        </div>
      </div>
    </div>
  );
}
