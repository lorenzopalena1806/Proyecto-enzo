import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para el lado del CLIENTE (browser).
 * Usar en componentes React con 'use client'.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: 31536000, // 1 año para PWA persistente
        expires: new Date(Date.now() + 31536000 * 1000), // Fallback para WebView
      },
    }
  );
}
