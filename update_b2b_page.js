const fs = require('fs');
let code = fs.readFileSync('components/dashboard/B2BOffersSection.tsx', 'utf8');

const oldImageRender = `                  {offer.image_url && (
                    <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Image src={offer.image_url} alt={offer.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                    </div>
                  )}`;

const newImageRender = `                  {offer.image_url && offer.image_display_mode !== 'contain' && (
                    <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Image src={offer.image_url} alt={offer.title} fill sizes="(max-width: 768px) 100vw, 50vw" className={\`object-cover \${offer.image_position || 'object-center'}\`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                    </div>
                  )}`;

if (code.includes(oldImageRender)) {
  code = code.replace(oldImageRender, newImageRender);
}

const oldTitleRender = `                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="font-bold text-lg text-white mb-2 pr-12 leading-tight drop-shadow-md">{offer.title}</h3>`;

const newTitleRender = `                  <div className="relative z-10 flex flex-col h-full">
                    {offer.image_url && offer.image_display_mode === 'contain' && (
                      <div className="w-full h-40 mb-4 bg-black/40 rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center p-2 mt-8">
                        <img src={offer.image_url} alt={offer.title} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <h3 className={\`font-bold text-lg text-white mb-2 pr-12 leading-tight drop-shadow-md \${offer.image_url && offer.image_display_mode === 'contain' ? 'mt-2' : 'mt-8'}\`}>{offer.title}</h3>`;

if (code.includes(oldTitleRender)) {
  code = code.replace(oldTitleRender, newTitleRender);
}

fs.writeFileSync('components/dashboard/B2BOffersSection.tsx', code);
console.log('Done B2B offers page');
