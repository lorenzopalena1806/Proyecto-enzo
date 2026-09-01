import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('merchant_employees')
    .select('name, branch_id, branch:merchant_branches(name), merchant:profiles!merchant_id(business_name)')
    .eq('id', 'd3da194f-b039-4ad8-bf25-3e9177aa6f00');
  console.log(JSON.stringify({ data, error }, null, 2));
}

check();
