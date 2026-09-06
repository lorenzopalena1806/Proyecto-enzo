const fs = require('fs');
let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

const stateSearch = `      avatar_url: profile.avatar_url || '',
      maps_url: profile.maps_url || '',`;

const stateReplace = `      avatar_url: profile.avatar_url || '',
      banner_url: (profile as any).banner_url || '',
      maps_url: profile.maps_url || '',`;

code = code.replace(stateSearch, stateReplace);

const submitSearch = `        avatar_url: formData.avatar_url || null,
        maps_url: formData.maps_url || null,`;

const submitReplace = `        avatar_url: formData.avatar_url || null,
        banner_url: (formData as any).banner_url || null,
        maps_url: formData.maps_url || null,`;

code = code.replace(submitSearch, submitReplace);

fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('Fixed state accurately');
