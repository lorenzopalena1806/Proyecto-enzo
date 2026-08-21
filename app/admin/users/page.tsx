import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import { Store, User, Mail, Calendar, ShieldAlert } from 'lucide-react';

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registro de Usuarios</h1>
          <p className="text-slate-500 mt-1 font-medium">Acá podés ver quién se registra, su rol y su correo.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Usuario / Email</th>
                <th className="px-6 py-4 font-bold">Rol</th>
                <th className="px-6 py-4 font-bold">Negocio / Detalles</th>
                <th className="px-6 py-4 font-bold text-right">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {enrichedProfiles.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        user.role === 'merchant' ? 'bg-blue-50 text-blue-600' : 
                        user.role === 'superadmin' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {user.role === 'merchant' ? <Store className="h-5 w-5" /> : 
                         user.role === 'superadmin' ? <ShieldAlert className="h-5 w-5" /> :
                         <User className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.full_name || 'Sin nombre'}</div>
                        <div className="text-slate-500 text-xs font-medium flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      user.role === 'merchant' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                      user.role === 'superadmin' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {user.role === 'merchant' ? 'Comercio' : 
                       user.role === 'superadmin' ? 'Superadmin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'merchant' ? (
                      <div>
                        <div className="text-slate-900 font-bold">{user.business_name || 'Sin nombre'}</div>
                        {user.phone && <div className="text-slate-500 font-medium text-xs mt-0.5">Tel: {user.phone}</div>}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 font-medium">
                    <div className="flex items-center justify-end gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.created_at).toLocaleDateString('es-AR')}
                    </div>
                  </td>
                </tr>
              ))}
              
              {enrichedProfiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No hay usuarios registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-800">Privacidad y Seguridad</h4>
          <p className="text-xs text-amber-700 font-medium mt-1">Por cuestiones de seguridad, las contraseñas no se muestran ni se guardan en texto plano en la base de datos. Están cifradas por Supabase Auth. Si un usuario pierde acceso, podés restablecer su contraseña desde el panel externo de Supabase.</p>
        </div>
      </div>
    </div>
  );
}
