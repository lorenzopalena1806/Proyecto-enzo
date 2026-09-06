const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

const replaceTotalSaved = `const totalSaved = 0; // Se movió al historial`;
const fetchTotalSaved = `
  const { data: clientHistoryTotal } = await adminClient
    .from('discount_transactions')
    .select('original_amount, final_amount')
    .eq('scanned_user_id', user.id);
  
  const totalSaved = (clientHistoryTotal || []).reduce((acc: number, tx: any) => acc + ((tx.original_amount || 0) - (tx.final_amount || 0)), 0);
`;

code = code.replace(replaceTotalSaved, fetchTotalSaved);

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Restored totalSaved badge logic in qr page');
