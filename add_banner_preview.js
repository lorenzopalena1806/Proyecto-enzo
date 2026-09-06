const fs = require('fs');
let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

const targetSection = `            <div className="space-y-1.5 mt-4">
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

const replacement = `            <div className="space-y-1.5 mt-4">
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

              {Boolean((formData as any).banner_url) && (
                <div className="mt-2 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="w-full h-24 rounded-lg bg-slate-900 overflow-hidden relative border border-slate-700">
                    <img 
                      src={(formData as any).banner_url} 
                      alt="Vista previa portada" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} 
                    />
                  </div>
                  <p className="text-[11px] text-emerald-400 font-medium">✓ Vista previa de tu portada (perfil público)</p>
                </div>
              )}
            </div>`;

if (!code.includes(targetSection)) {
  console.error("Could not find targetSection");
  process.exit(1);
}

code = code.replace(targetSection, replacement);
fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('Successfully added live preview for banner in ProfileEditForm!');
