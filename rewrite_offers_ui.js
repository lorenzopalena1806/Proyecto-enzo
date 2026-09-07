const fs = require('fs');

let code = fs.readFileSync('components/dashboard/OffersManager.tsx', 'utf8');

// 1. ADD NEW INPUTS TO THE FORM
const formInputHtml = `              {preview.image_url && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Estilo de la Foto</label>
                    <select name="image_display_mode" value={preview.image_display_mode} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none">
                      <option value="background">De Fondo (Completa)</option>
                      <option value="contain">Destacada (Nítida y Centrada)</option>
                    </select>
                  </div>
                  {preview.image_display_mode === 'background' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Enfoque de la Foto</label>
                      <select name="image_position" value={preview.image_position} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none">
                        <option value="object-center">Centro (Por defecto)</option>
                        <option value="object-top">Parte Superior</option>
                        <option value="object-bottom">Parte Inferior</option>
                        <option value="object-left">Izquierda</option>
                        <option value="object-right">Derecha</option>
                      </select>
                    </div>
                  )}
                </div>
              )}`;

const targetFormStr = `              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Enlace (URL) de la Foto (opcional pero recomendado)</label>
                <input type="url" name="image_url" value={preview.image_url} onChange={handleChange} placeholder="Ej: https://misitio.com/foto.jpg" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
                <p className="text-xs text-slate-500 mt-1">Pegá el link de una imagen que ya esté en internet.</p>
              </div>`;

if (code.includes(targetFormStr) && !code.includes('Estilo de la Foto')) {
  code = code.replace(targetFormStr, targetFormStr + '\n\n' + formInputHtml);
}

// 2. UPDATE PREVIEW CARD (Background logic)
const oldPreviewImg = `                  {preview.image_url ? (
                    <div className="absolute inset-0 z-0 opacity-30">
                      <img src={preview.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 z-0 opacity-10 bg-violet-500/20">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    </div>
                  )}`;

const newPreviewImg = `                  {preview.image_url && preview.image_display_mode === 'background' ? (
                    <div className="absolute inset-0 z-0 opacity-30">
                      <img src={preview.image_url} alt="Preview" className={\`w-full h-full object-cover \${preview.image_position || 'object-center'}\`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                    </div>
                  ) : preview.image_display_mode === 'contain' ? null : (
                    <div className="absolute inset-0 z-0 opacity-10 bg-violet-500/20">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    </div>
                  )}`;
if (code.includes(oldPreviewImg)) {
  code = code.replace(oldPreviewImg, newPreviewImg);
}

// 3. UPDATE PREVIEW CARD (Contain logic)
const oldPreviewTitle = `                  <div className="relative z-10 flex flex-col h-full min-h-[160px] pt-8">
                    <h3 className="font-bold text-lg text-white mb-2 pr-8 leading-tight">
                      {preview.title || 'Título de tu oferta'}
                    </h3>`;

const newPreviewTitle = `                  <div className="relative z-10 flex flex-col h-full min-h-[160px] pt-8">
                    {preview.image_url && preview.image_display_mode === 'contain' && (
                      <div className="w-full h-40 mb-4 bg-black/60 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-white/10">
                        <img src={preview.image_url} alt="Preview" className="w-full h-full object-contain drop-shadow-md" />
                      </div>
                    )}
                    <h3 className="font-bold text-lg text-white mb-2 pr-8 leading-tight">
                      {preview.title || 'Título de tu oferta'}
                    </h3>`;
if (code.includes(oldPreviewTitle)) {
  code = code.replace(oldPreviewTitle, newPreviewTitle);
}

// 4. UPDATE EXISTING OFFERS LIST
const oldListImg = `              {offer.image_url && (
                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden relative border border-slate-700/50">
                  <Image src={offer.image_url} alt={offer.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                </div>
              )}`;

const newListImg = `              {offer.image_url && offer.image_display_mode !== 'contain' && (
                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden relative border border-slate-700/50">
                  <Image src={offer.image_url} alt={offer.title} fill sizes="(max-width: 768px) 100vw, 50vw" className={\`object-cover \${offer.image_position || 'object-center'}\`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                </div>
              )}
              {offer.image_url && offer.image_display_mode === 'contain' && (
                <div className="w-full h-40 mb-4 bg-black/40 rounded-xl overflow-hidden relative border border-slate-700/50 flex items-center justify-center p-2">
                  <img src={offer.image_url} alt={offer.title} className="w-full h-full object-contain" />
                </div>
              )}`;
if (code.includes(oldListImg)) {
  code = code.replace(oldListImg, newListImg);
}

// 5. UPDATE API CALL in handleSubmit (adding image_display_mode and image_position)
// We already added them to `preview`, so `const payload = { ...preview };` might naturally grab them if that's what happens. Let's check handleSubmit later.

fs.writeFileSync('components/dashboard/OffersManager.tsx', code);
console.log('Done rewriting OffersManager');
