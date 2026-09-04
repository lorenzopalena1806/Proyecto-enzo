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
  const { data: profiles } = await supabase.from('profiles').select('id, business_name').eq('role', 'merchant').not('latitude', 'is', null);
  const { data: branches } = await supabase.from('merchant_branches').select('merchant_id');
  
  const branchesSet = new Set(branches?.map(b => b.merchant_id));
  
  const profilesWithoutBranches = profiles?.filter(p => !branchesSet.has(p.id)) || [];
  
  console.log('Profiles with coordinates but NO branches:', profilesWithoutBranches);
}
run();
