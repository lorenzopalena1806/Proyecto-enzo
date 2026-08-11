import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching a merchant...");
  const { data: merchants, error: fetchErr } = await supabase.from('profiles').select('*').eq('role', 'merchant').limit(1);
  
  if (fetchErr || !merchants || merchants.length === 0) {
    console.error("Error fetching merchant:", fetchErr);
    return;
  }
  
  const merchantId = merchants[0].id;
  console.log("Merchant ID:", merchantId);
  
  console.log("Attempting to insert subscription...");
  const { data, error } = await supabase.from('subscriptions').insert({
    merchant_id: merchantId,
    status: 'active',
    plan_name: 'basic',
    started_at: new Date().toISOString(),
  });
  
  if (error) {
    console.error("INSERT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS:", data);
  }
}

test();
