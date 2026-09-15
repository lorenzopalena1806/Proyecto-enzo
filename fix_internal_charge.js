const fs = require('fs');
let code = fs.readFileSync('app/actions/charge.ts', 'utf8');

// Undo the injection in processPaymentByShortCodeServer
code = code.replace(
  `export async function processPaymentByShortCodeServer(merchantId: string, amount: number, method: PaymentMethod, shortCode: string, offerId?: string, branchId?: string) {\n  const supabase = await createClient();\n  const { data: { user } } = await supabase.auth.getUser();\n  if (!user || user.id !== merchantId) {\n    return { success: false, reason: 'No autorizado. Sesión inválida.' };\n  }\n`,
  `export async function processPaymentByShortCodeServer(merchantId: string, amount: number, method: PaymentMethod, shortCode: string, offerId?: string, branchId?: string) {\n  const supabase = await createClient();\n  const { data: { user } } = await supabase.auth.getUser();\n  if (!user || user.id !== merchantId) {\n    return { success: false, reason: 'No autorizado. Sesión inválida.' };\n  }\n  return await internalProcessPaymentByShortCode(merchantId, amount, method, shortCode, offerId, branchId);\n}\n\nexport async function internalProcessPaymentByShortCode(merchantId: string, amount: number, method: PaymentMethod, shortCode: string, offerId?: string, branchId?: string) {\n`
);

fs.writeFileSync('app/actions/charge.ts', code);
console.log('Fixed internal function in charge.ts');
