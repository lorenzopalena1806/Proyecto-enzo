const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  // Try to find the user in profiles by full_name or id
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('full_name', 'lorenzopalena1806@gmail.com');
  
  if (error) {
    console.error('Error fetching profiles by full_name:', error);
  } else {
    console.log('Profile by full_name:', data);
  }

  // Find all profiles just to see what exists
  const { data: allProfiles, error: errAll } = await supabase
    .from('profiles')
    .select('*');
  
  console.log('All Profiles Count:', allProfiles?.length);
  if (allProfiles) {
    console.log('All Profiles:', allProfiles);
  }
}

checkUser();
