const fs = require('fs');
let code = fs.readFileSync('middleware.ts', 'utf8');

const targetStr = `  // Llamar a getUser() refresca el token automáticamente si está expirado
  // y dispara el setAll() de arriba para guardar las nuevas cookies
  await supabase.auth.getUser()

  return supabaseResponse`;

const replacementStr = `  // Llamar a getUser() refresca el token automáticamente si está expirado
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

  return supabaseResponse`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('middleware.ts', code);
console.log('Fixed middleware.ts');
