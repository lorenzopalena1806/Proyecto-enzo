import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';
env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const merchantId = '932b13d0-698f-4c92-810b-f96361e6c380'; // pruebalocal
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, plan_type, mp_subscription_status, subscription_expires_at, is_active, is_premium')
    .eq('id', merchantId)
    .single();

  console.log('Profile:', profile);
  
  // Dashboard layout logic
  if (profile.subscription_expires_at) {
    const expires = new Date(profile.subscription_expires_at);
    const today = new Date();
    console.log('Expires:', expires, 'Today:', today, 'Is Expired?', expires < today);
  }
  
  // Dashboard pro logic
  console.log('Is BASIC Active?', profile.plan_type === 'basic' && profile.mp_subscription_status === 'authorized');
  console.log('Is PRO Active?', profile.plan_type === 'pro' && profile.mp_subscription_status === 'authorized');
}
run();
