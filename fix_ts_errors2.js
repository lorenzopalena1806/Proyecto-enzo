const fs = require('fs');

// 1. Fix ProfileEditForm.tsx
let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

// Remove isPro block completely using regex
code = code.replace(/\{\!isPro && \([\s\S]*?\}\)/g, '');
code = code.replace(/disabled=\{\!isPro\}/g, '');

fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('✅ components/dashboard/ProfileEditForm.tsx fixed');

// 2. Fix history/page.tsx
code = fs.readFileSync('app/dashboard/history/page.tsx', 'utf8');
// Replace role, plan_type with just role
code = code.replace(/\.select\(['"]role, plan_type['"]\)/g, ".select('role')");

// Also remove `const isBasic = profile?.plan_type === 'basic';` completely
code = code.replace(/const isBasic = .*?plan_type === 'basic';\n*/g, '');

fs.writeFileSync('app/dashboard/history/page.tsx', code);
console.log('✅ app/dashboard/history/page.tsx fixed');
