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
  const { error } = await supabase.from('profiles').update({
    latitude: null,
    longitude: null,
    maps_url: null,
    address: null
  }).eq('role', 'merchant');
  console.log('Update Error:', error);
}
run();
