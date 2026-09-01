'use server';

import { createClient } from '@/lib/supabase-server';

export async function reportErrorToServer(errorData: { message: string; stack?: string; digest?: string; url: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Formatear el error para que sea visible rápidamente en los logs de Vercel del Superadmin
    console.error('🚨 [LAZOO SUPERADMIN ALERT] APP ERROR REPORT 🚨');
    console.error(`Time: ${new Date().toISOString()}`);
    console.error(`User ID: ${user?.id || 'Unauthenticated'}`);
    console.error(`URL: ${errorData.url}`);
    console.error(`Message: ${errorData.message}`);
    if (errorData.digest) console.error(`Digest: ${errorData.digest}`);
    
    // Si tuviéramos una tabla system_errors, lo guardaríamos aquí.
    // Por el momento, en Vercel esto generará un log de ERROR crítico (rojo).
    // Idealmente, acá podríamos conectar una API a un bot de Telegram del Superadmin.

    return { success: true };
  } catch (err) {
    console.error('Failed to report error:', err);
    return { success: false };
  }
}
