const fs = require('fs');
let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

code = code.replace(
  `avatar_url: profile.avatar_url || '',`,
  `avatar_url: profile.avatar_url || '',
    banner_url: (profile as any).banner_url || '',`
);

code = code.replace(
  `avatar_url: formData.avatar_url || null,`,
  `avatar_url: formData.avatar_url || null,
      banner_url: formData.banner_url || null,`
);

const bannerFieldHtml = `            </div>
          </div>
        </div>

        {/* Banner Input (new) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden mt-6">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <ImageIcon className="w-32 h-32 text-indigo-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-2">
            <ImageIcon className="text-indigo-400 w-5 h-5" />
            Banner del Perfil
          </h2>
          
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL de tu foto de portada
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold text-sm">http://</span>
                </div>
                <input
                  name="banner_url"
                  type="url"
                  value={formData.banner_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://misitio.com/banner.png"
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Esta foto se mostrará grande arriba de todo en tu perfil. Si no ponés nada, se usará tu logo.
              </p>
            </div>
            
            {formData.banner_url && (
              <div className="mt-4 border border-slate-700 rounded-xl overflow-hidden relative h-32 w-full bg-slate-900">
                <img src={formData.banner_url} alt="Banner Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>`;

code = code.replace(
  `            </div>
          </div>
        </div>`,
  bannerFieldHtml
);

fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('Added banner_url to ProfileEditForm');
