const fs = require('fs');
const path = require('path');

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

// 1. Sidebar.tsx
replaceInFile('components/dashboard/Sidebar.tsx', [
  { from: /^\s*badge:\s*'PRO',\s*$/gm, to: '' },
  { from: /\{\s*href:\s*'\/dashboard\/pro'[\s\S]*?\},/g, to: '' }, // Remove the entire Planes y Suscripcion item
  { from: /\{\s*item\.badge\s*&&\s*\([\s\S]*?\}\s*\)\s*\}/g, to: '' }, // Remove the badge rendering
]);

// 2. ProfileEditForm.tsx (remove the span with "Plan Pro")
replaceInFile('components/dashboard/ProfileEditForm.tsx', [
  { from: /<span className="[^"]*">Plan Pro<\/span>/g, to: '' },
]);

// 3. OnboardingTour.tsx (remove references to Plan PRO)
replaceInFile('components/dashboard/OnboardingTour.tsx', [
  { from: / Si tenés el Plan PRO, ¡también podés vincular tu Instagram para sumar seguidores!/g, to: '' },
  { from: / Si sos PRO, podés agregar múltiples sucursales\./g, to: '' },
  { from: / \(Exclusivo PRO\)/g, to: '' },
  { from: /o pasarte al Plan PRO cuando quieras potenciar tus ventas y desbloquear más funciones\./g, to: '' },
  // And remove the #tour-pro step entirely
  { from: /\{\s*element:\s*getSelector\('#tour-pro'\)[\s\S]*?\},/g, to: '' },
]);

// 4. Admin PremiumManager.tsx
replaceInFile('components/admin/PremiumManager.tsx', [
  { from: /Suscripción PRO B2B/g, to: 'Suscripción B2B' },
  { from: /'Activo \(Lazoo PRO\)'/g, to: "'Activo'" },
  { from: /'Inactivo \(Plan Básico\)'/g, to: "'Inactivo'" },
  { from: /'Revocar Acceso PRO'/g, to: "'Revocar Acceso'" },
  { from: /'Habilitar Acceso PRO'/g, to: "'Habilitar Acceso'" },
]);

// 5. MerchantStatusDropdown.tsx
replaceInFile('components/admin/MerchantStatusDropdown.tsx', [
  { from: /'Plan PRO'/g, to: "'Activo'" },
  { from: /Activar Plan PRO/g, to: 'Activar' },
]);

// 6. PricingForm.tsx
replaceInFile('app/admin/settings/PricingForm.tsx', [
  { from: /Precio Plan PRO/g, to: 'Precio Suscripción' },
]);

// 7. mp.ts
replaceInFile('app/actions/mp.ts', [
  { from: /'Lazoo Plan PRO'/g, to: "'Suscripción Lazoo'" },
]);

// 8. admin/page.tsx
replaceInFile('app/admin/page.tsx', [
  { from: /Plan PRO/g, to: 'Activos' },
]);

console.log('Done replacing PRO references.');
