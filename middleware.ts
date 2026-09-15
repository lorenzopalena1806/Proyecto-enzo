import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Esta respuesta se va a modificar si Supabase necesita actualizar las cookies
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Actualiza los headers de la request para que los Server Components vean las nuevas cookies
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // 2. Actualiza los headers de la respuesta para que el navegador guarde las nuevas cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: 31536000, // 1 año forzado para PWA
              expires: new Date(Date.now() + 31536000 * 1000) // Fallback para WebView
            })
          )
        },
      },
    }
  )

  // Llamar a getUser() refresca el token automáticamente si está expirado
  // y dispara el setAll() de arriba para guardar las nuevas cookies
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;
  
  // Basic route protection
  if (!user && (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/client'))) {
    // Check if it's a public client route (e.g., specific merchant page or auth callback, let's keep it simple)
    if (!path.startsWith('/client/merchant/') && path !== '/client/qr') {
       return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Prevent logged in users from visiting auth pages
  if (user && path.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/client/qr', request.url));
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, etc
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
