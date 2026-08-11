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

async function testVercel() {
  const email = 'admin@redbeneficios.com';
  const password = 'AdminPassword123!';

  console.log('1. Signing in to get session cookie');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) return console.error('Sign in error:', signInError);

  const accessToken = signInData.session.access_token;
  const refreshToken = signInData.session.refresh_token;
  
  const cookieName = `sb-${new URL(envVars.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
  const cookieValue = encodeURIComponent(JSON.stringify([accessToken, refreshToken, null, null, null]));
  const cookieString = `${cookieName}=${cookieValue}`;

  console.log('2. Requesting /admin from Vercel');
  const res = await fetch('https://proyecto-enzo.vercel.app/admin', {
    headers: {
      'Cookie': cookieString
    },
    redirect: 'manual'
  });

  console.log('Vercel /admin Status:', res.status);
  console.log('Vercel /admin Headers Location:', res.headers.get('location'));
  
  if (res.status === 200) {
      const text = await res.text();
      console.log('Response body preview:', text.substring(0, 500));
  }
  
  console.log('3. Requesting /dashboard from Vercel');
  const resDash = await fetch('https://proyecto-enzo.vercel.app/dashboard', {
    headers: {
      'Cookie': cookieString
    },
    redirect: 'manual'
  });

  console.log('Vercel /dashboard Status:', resDash.status);
  console.log('Vercel /dashboard Headers Location:', resDash.headers.get('location'));
}

testVercel();
