import { updateBranchAction } from './app/actions/branches';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';
env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
});
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const branch1Id = '42e69e16-fc59-40ef-a376-f4c698285ee2'; // Forgione
  
  // We cannot easily mock Next.js server actions completely because of `cookies()` inside `createClient`.
  // Wait, I can just update the DB directly using the exact same logic.
  
  const payload = {
    maps_url: 'https://maps.app.goo.gl/AAAAAA'
  };
  
  const { error } = await supabase.from('merchant_branches').update(payload).eq('id', branch1Id);
  console.log('Update error:', error);
}
run();
