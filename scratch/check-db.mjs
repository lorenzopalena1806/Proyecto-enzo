import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, full_name, business_name, role');
  console.log("Profiles:", profiles);
  
  const { data: subscriptions, error: sErr } = await supabase.from('subscriptions').select('*');
  console.log("Subscriptions:", subscriptions);
  if (sErr) console.error("Subs err:", sErr);
}

checkDb();
