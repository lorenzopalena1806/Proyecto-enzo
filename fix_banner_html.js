const fs = require('fs');
let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

const search = `            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Link del Logo (URL de imagen)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold text-sm">http://</span>
                </div>
                <input
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://misitio.com/logo.png"
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>`;

const replace = `            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Link del Logo (URL de imagen)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold text-sm">http://</span>
                </div>
                <input
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://misitio.com/logo.png"
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <label className="block text-sm font-medium text-slate-300">Link del Banner (URL de portada)</label>
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
              <p className="mt-1 text-xs text-slate-400">Si lo dejás vacío, se usa el logo ampliado.</p>
            </div>`;

code = code.replace(search, replace);
fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('Fixed banner html');
