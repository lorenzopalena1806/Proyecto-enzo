import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Cliente de Supabase para el lado del SERVIDOR.
 * Usar en Server Components, Route Handlers y Server Actions.
 *
 * Lee las cookies de la request actual para mantener la sesión.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { 
                ...options, 
                maxAge: 31536000, // 1 año
                expires: new Date(Date.now() + 31536000 * 1000) // Fallback para WebView
              }),
            );
          } catch {
            // Ignorar en Server Components de solo lectura
          }
        },
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, { ...options, cache: 'no-store' });
        },
      },
    },
  );
}

/**
 * Cliente de Supabase con privilegios de SERVICE ROLE.
 * Solo usar en rutas de API protegidas o en server actions del SuperAdmin.
 * NUNCA exponer en el cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
