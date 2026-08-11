const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('1. Fetching all users...');
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) return console.error(usersError);
  
  const adminUser = usersData.users.find(u => u.email === 'admin@redbeneficios.com');
  if (!adminUser) return console.error('Admin user not found!');
  
  console.log('Admin User ID:', adminUser.id);
  
  console.log('2. Fetching profile from profiles table...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', adminUser.id)
    .single();
    
  if (profileError) {
    console.error('Error fetching profile:', profileError);
  } else {
    console.log('Profile Data:', profileData);
  }
}

check();
