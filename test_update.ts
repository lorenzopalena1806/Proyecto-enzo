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
  const branch1Id = '42e69e16-fc59-40ef-a376-f4c698285ee2'; // Forgione
  const branch2Id = '1972c146-5b94-4cc0-abfd-500a1cf79343'; // Estanzuela
  
  // Update branch 1 to a dummy coordinate
  const { error } = await supabase.from('merchant_branches').update({ latitude: -10, longitude: -10 }).eq('id', branch1Id);
  console.log('Update Branch 1 error:', error);
  
  // Fetch both branches
  const { data: branches } = await supabase.from('merchant_branches').select('id, name, latitude, longitude').in('id', [branch1Id, branch2Id]);
  console.log('Branches after update:', branches);
}
run();
