const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

// Replace the manual bottom nav with <ClientBottomNav />
const bottomNavRegex = /\{\/\* Floating Bottom Navigation Bar \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
code = code.replace(bottomNavRegex, '<ClientBottomNav />');

// Add import if not exists
if (!code.includes('ClientBottomNav')) {
  code = code.replace(
    `import { ShareButton } from '@/components/shared/ShareButton';`,
    `import { ShareButton } from '@/components/shared/ShareButton';\nimport { ClientBottomNav } from '@/components/client/ClientBottomNav';`
  );
}

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Replaced bottom nav in qr page');
