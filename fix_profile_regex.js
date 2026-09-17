const fs = require('fs');

let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

// Replace { !isPro && (...) } block using regex
code = code.replace(/\{\s*!isPro\s*&&\s*\([\s\S]*?<\/a>\s*\)\s*\}/, '');

// Replace disabled={!isPro} using regex
code = code.replace(/disabled=\{\!isPro\}/g, '');

// Remove isPro from props
code = code.replace(/isPro\s*=\s*false\s*/g, '');
code = code.replace(/isPro\?: boolean;/g, '');
code = code.replace(/,\s*isPro\s*/g, '');

fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('✅ ProfileEditForm updated with Regex');
