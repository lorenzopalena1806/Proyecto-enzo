const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

if (!code.includes('import { ClientBottomNav }')) {
  code = code.replace(
    `import { ShareButton } from '@/components/shared/ShareButton';`,
    `import { ShareButton } from '@/components/shared/ShareButton';\nimport { ClientBottomNav } from '@/components/client/ClientBottomNav';`
  );
  fs.writeFileSync('app/client/qr/page.tsx', code);
}
console.log('Added import to qr page');
