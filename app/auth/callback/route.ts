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
      // Auto-create profile for Google Auth users if it doesn't exist
      const { createAdminClient } = await import('@/lib/supabase-server');
      const adminClient = createAdminClient();
      
      let { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (!profile) {
        // It's a new user from Google Login, create default client profile
        const fullName = authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || 'Usuario';
        await adminClient.from('profiles').insert({
          id: authData.user.id,
          role: 'client',
          full_name: fullName,
          is_active: true
        });
        profile = { role: 'client' };
      }

      const role = profile.role;
      let redirectUrl = '/client/qr';
      if (role === 'superadmin') redirectUrl = '/admin';
      else if (role === 'merchant') redirectUrl = '/dashboard';
      
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
    }
  }

  // Si hay error o no hay código, llevar a login de vuelta
  return NextResponse.redirect(new URL('/auth/login?error=oauth', requestUrl.origin));
}
