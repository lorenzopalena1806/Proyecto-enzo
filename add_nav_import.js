const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

if (!code.includes('import { ClientBottomNav }')) {
  code = `import { ClientBottomNav } from '@/components/client/ClientBottomNav';\n` + code;
  fs.writeFileSync('app/client/qr/page.tsx', code);
}
console.log('Added import explicitly');
