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
  const { data: user } = await supabase.from('profiles').select('id, full_name, role, maps_url').eq('id', 'adc3af80-e599-4c74-ad67-11388572d9bd').single();
  console.log('User profile:', user);
  
  const { data: branches } = await supabase.from('merchant_branches').select('id, name, address, latitude, longitude, maps_url').eq('merchant_id', 'adc3af80-e599-4c74-ad67-11388572d9bd');
  console.log('Branches:', branches);
}
run();
