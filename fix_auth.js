const fs = require('fs');
let code = fs.readFileSync('app/actions/auth.ts', 'utf8');

const targetStr = `export async function updateProfileServer(userId: string, data: any) {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('profiles')
    .update(data)
    .eq('id', userId);
  return { success: !error, error };
}`;

const replacementStr = `export async function updateProfileServer(userId: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    return { success: false, error: { message: 'No autorizado' } };
  }

  // Filtramos campos sensibles para evitar escalamiento de privilegios
  const safeData = { ...data };
  delete safeData.role;
  delete safeData.plan_type;
  delete safeData.mp_subscription_id;
  delete safeData.mp_subscription_status;
  delete safeData.id;

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('profiles')
    .update(safeData)
    .eq('id', userId);
  return { success: !error, error };
}`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('app/actions/auth.ts', code);
console.log('Fixed auth.ts');
