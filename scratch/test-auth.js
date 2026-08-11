const { createClient } = require('@supabase/supabase-js');

const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const email = 'admin@redbeneficios.com';
  const password = 'AdminPassword123!';

  console.log('1. Signing in to get session cookie');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error('Sign in error:', signInError);
    return;
  }

  const accessToken = signInData.session.access_token;
  const refreshToken = signInData.session.refresh_token;

  console.log('Tokens obtained.');
  
  // Create cookie string exactly as @supabase/ssr does
  const cookieString = `sb-${new URL(envVars.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]}-auth-token=${encodeURIComponent(JSON.stringify([accessToken, refreshToken, null, null, null]))}`;

  console.log('2. Requesting profile using the session in node client');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signInData.user.id)
    .single();

  console.log('Profile:', profile, 'Error:', profileError);

  console.log('3. Requesting qr using the session in node client');
  const { data: qr, error: qrError } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', signInData.user.id)
    .single();

  console.log('QR:', qr, 'Error:', qrError);
}

test();
