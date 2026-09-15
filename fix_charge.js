const fs = require('fs');
let code = fs.readFileSync('app/actions/charge.ts', 'utf8');

const injection = `
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== merchantId) {
    return { success: false, reason: 'No autorizado. Sesión inválida.' };
  }
`;

// Insert into processPaymentByShortCodeServer
code = code.replace(
  `export async function processPaymentByShortCodeServer(merchantId: string, amount: number, method: PaymentMethod, shortCode: string, offerId?: string, branchId?: string) {`,
  `export async function processPaymentByShortCodeServer(merchantId: string, amount: number, method: PaymentMethod, shortCode: string, offerId?: string, branchId?: string) {${injection}`
);

// Insert into confirmScannedPaymentServer
code = code.replace(
  `export async function confirmScannedPaymentServer(merchantId: string, amount: number, method: PaymentMethod, offerId?: string, branchId?: string) {`,
  `export async function confirmScannedPaymentServer(merchantId: string, amount: number, method: PaymentMethod, offerId?: string, branchId?: string) {${injection}`
);

fs.writeFileSync('app/actions/charge.ts', code);
console.log('Fixed charge.ts');
