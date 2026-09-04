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
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'profiles' });
  console.log('RPC Error:', error);
  
  // Alternative: try to update a fake user
  const { error: updErr } = await supabase.from('profiles').update({ plan_type: 'pro' }).eq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Update Error on fake ID:', updErr);
}
run();
