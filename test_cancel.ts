import * as fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf-8');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';
let MP_TOKEN = '';
env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
  if (line.startsWith('MP_ACCESS_TOKEN=')) MP_TOKEN = line.split('=')[1].trim();
});

async function run() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, mp_subscription_id, mp_subscription_status').not('mp_subscription_id', 'is', null).limit(10);
  console.log('Profiles with MP ID:', profiles);
  
  if (profiles && profiles.length > 0 && profiles[0].mp_subscription_id) {
    const subId = profiles[0].mp_subscription_id;
    console.log('Testing cancellation on:', subId);
    
    const res = await fetch('https://api.mercadopago.com/preapproval/' + subId, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + MP_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelled' })
    });
    
    const data = await res.json();
    console.log('Cancel response:', data);
  }
}
run();
