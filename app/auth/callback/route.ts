import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getUserRoleById } from '@/app/actions/auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && authData.user) {
      // Fetch role and route dynamically
      const role = await getUserRoleById(authData.user.id);
      let redirectUrl = '/client/qr';
      if (role === 'superadmin') redirectUrl = '/admin';
      else if (role === 'merchant') redirectUrl = '/dashboard';
      
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
    }
  }

  // Si hay error o no hay código, llevar a login de vuelta
  return NextResponse.redirect(new URL('/auth/login?error=oauth', requestUrl.origin));
}
