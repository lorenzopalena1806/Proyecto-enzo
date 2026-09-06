const fs = require('fs');
let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

// Add banner_url to state
code = code.replace(
  `avatar_url: profile.avatar_url || '',`,
  `avatar_url: profile.avatar_url || '',
      banner_url: (profile as any).banner_url || '',`
);

code = code.replace(
  `avatar_url: formData.avatar_url || null,`,
  `avatar_url: formData.avatar_url || null,
        banner_url: (formData as any).banner_url || null,`
);

fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('Fixed banner state');
