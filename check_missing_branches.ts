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
  const { data: branches } = await supabase.from('merchant_branches').select('merchant_id');
  const branchesSet = new Set(branches?.map(b => b.merchant_id));

  const { data: allMerchants } = await supabase.from('profiles').select('id, business_name, address, latitude, longitude').eq('role', 'merchant').eq('is_active', true);
  
  const merchantsWithoutBranches = allMerchants?.filter(m => !branchesSet.has(m.id)) || [];
  console.log('Merchants without branches:', merchantsWithoutBranches);
}
run();
