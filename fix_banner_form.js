const fs = require('fs');
let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

const search = `<input
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://misitio.com/logo.png"
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>`;

const replace = `<input
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://misitio.com/logo.png"
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
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
              <p className="text-[11px] text-slate-400 mt-1">Si no ponés nada, tu logo se usará como portada.</p>
            </div>`;

code = code.replace(search, replace);

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
console.log('Fixed banner form');
