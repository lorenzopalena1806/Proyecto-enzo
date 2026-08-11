const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno manual de .env.local
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

async function createSuperAdmin() {
  const email = 'admin@redbeneficios.com';
  const password = 'AdminPassword123!';

  console.log('1. Creando usuario con admin client:', email);
  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'superadmin',
      full_name: 'Super Admin Principal'
    }
  });

  let userId;
  if (signUpError) {
    console.log('El usuario ya existe o hubo error:', signUpError.message);
    // Intentar buscar al usuario
    const { data: users, error: findError } = await supabase.auth.admin.listUsers();
    const existing = users?.users?.find(u => u.email === email);
    if (existing) {
        userId = existing.id;
        console.log('Usuario existente encontrado:', userId);
        // Asegurar que esté confirmado
        await supabase.auth.admin.updateUserById(userId, { email_confirm: true });
        console.log('Email confirmado manualmente.');
    } else {
        return;
    }
  } else {
      userId = signUpData.user.id;
      console.log('Usuario creado exitosamente:', userId);
  }
  console.log('User ID:', userId);

  // Esperar un segundo por las dudas de que el trigger esté corriendo
  await new Promise(r => setTimeout(r, 1000));

  console.log('2. Asegurando que el perfil sea superadmin');
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'superadmin' })
    .eq('id', userId);

  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Perfil actualizado a superadmin exitosamente.');
  }
  
  console.log('3. Asegurando que tenga un QR_Code (para evitar errores 404)');
  // Aunque superadmin no lo use mucho, si entra a dashboard lo necesita
  const { error: qrError } = await supabase
    .from('qr_codes')
    .insert([{ user_id: userId, qr_token: 'admin-qr-token-' + Date.now() }])
    .select();
  
  if (qrError && qrError.code !== '23505') { // 23505 = unique_violation
    console.error('Error creando QR:', qrError);
  } else {
    console.log('QR Code asegurado.');
  }

  console.log('\n--- CREDENCIALES ---');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('--------------------\n');
}

createSuperAdmin();
