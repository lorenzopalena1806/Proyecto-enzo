const fs = require('fs');
let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

// I will just use regex to insert the banner field after the avatar field.
const avatarFieldRegex = /<label className="block text-sm font-medium text-slate-300">Link del Logo \(URL de imagen\)<\/label>[\s\S]*?<\/div>\s*<\/div>/;

const bannerFieldHtml = `
            <div className="space-y-1.5 mt-4">
              <label className="block text-sm font-medium text-slate-300">Link del Banner (URL de foto de portada)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold text-sm">http://</span>
                </div>
                <input
                  name="banner_url"
                  type="url"
                  value={(formData as any).banner_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://misitio.com/banner.png"
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Si no ponés nada, tu logo se usará como portada.</p>
            </div>`;

code = code.replace(avatarFieldRegex, match => match + bannerFieldHtml);

fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('Fixed banner html with regex');
