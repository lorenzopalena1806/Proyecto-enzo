import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { UserRole } from '@/types';

// ------ RUTAS PROTEGIDAS POR ROL ----------------------------

const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': ['merchant', 'superadmin'],
  '/admin': ['superadmin'],
  '/client': ['client', 'merchant', 'superadmin'],
};

// ------ PROXY PRINCIPAL (reemplaza middleware en Next.js 16) --

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Crear cliente Supabase con acceso a cookies de la request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, { ...options, cache: 'no-store' });
        },
      },
    },
  );

  // Obtener sesión actual
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // ── Rutas públicas: no requieren autenticación ────────────
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/scan'];
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith('/auth/'))) {
    // Si ya está logueado y va al login, redirigir al dashboard correcto
    if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
      const role = await getUserRole(supabase, user.id);
      return NextResponse.redirect(new URL(getDashboardByRole(role), request.url));
    }
    return supabaseResponse;
  }

  // ── Sin sesión: redirigir al login ────────────────────────
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Verificar permisos de rol ─────────────────────────────
  const role = await getUserRole(supabase, user.id);

  for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(role as UserRole)) {
        // Redirigir al dashboard apropiado del rol actual
        return NextResponse.redirect(
          new URL(getDashboardByRole(role), request.url),
        );
      }
      break;
    }
  }

  return supabaseResponse;
}

// ------ HELPERS ---------------------------------------------

async function getUserRole(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role ?? 'client';
}

function getDashboardByRole(role: string): string {
  if (role === 'superadmin') return '/admin';
  if (role === 'merchant') return '/dashboard';
  return '/client/qr';
}

// ------ CONFIGURACIÓN DE MATCHER ----------------------------

export const config = {
  matcher: [
    /*
     * Aplicar proxy a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - Archivos con extensión (imágenes, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
