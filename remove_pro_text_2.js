const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} updated.`);
  }
}

// 1. ProSubscriptionButtons.tsx
replaceInFile('app/dashboard/pro/ProSubscriptionButtons.tsx', [
  { from: /'Suscribirse al Plan PRO'/g, to: "'Activar Suscripción'" },
  { from: /'Renovar Plan PRO'/g, to: "'Activar Suscripción'" },
]);

// 2. app/dashboard/pro/page.tsx
replaceInFile('app/dashboard/pro/page.tsx', [
  { from: /Plan PRO Activo/g, to: 'Suscripción Activa' },
  { from: /Plan PRO/g, to: 'Suscripción' },
  { from: /PLAN PRO/g, to: 'SUSCRIPCIÓN' },
]);

// 3. app/suspended/page.tsx
replaceInFile('app/suspended/page.tsx', [
  { from: /Plan PRO/g, to: 'Suscripción' },
  { from: /PLAN PRO/g, to: 'SUSCRIPCIÓN' },
]);

// 4. app/subscription-required/page.tsx
replaceInFile('app/subscription-required/page.tsx', [
  { from: /Plan PRO/g, to: 'Suscripción' },
]);

// 5. app/dashboard/qr/page.tsx
replaceInFile('app/dashboard/qr/page.tsx', [
  { from: /Sort: PRO first, then featured, then created_at/g, to: 'Sort: featured, then created_at' }
]);

console.log('Done remaining PRO text replacements.');
