const fs = require('fs');
let code = fs.readFileSync('components/dashboard/OffersManager.tsx', 'utf8');

const searchStr = `                <div className="mt-auto pt-2">
                  <div className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wider">
                    Para: {offer.target_role === 'client' ? 'Clientes' : offer.target_role === 'merchant' ? 'Comercios' : 'Todos'}
                  </div>`;

const replaceStr = `                <div className="mt-auto pt-2">
                  <div className="flex justify-between items-center mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <span>Para: {offer.target_role === 'client' ? 'Clientes' : offer.target_role === 'merchant' ? 'Comercios' : 'Todos'}</span>
                    <span className="bg-slate-800/50 px-2 py-1 rounded-md text-emerald-400">Escaneos: {offer.used_count || 0}</span>
                  </div>`;

code = code.replace(searchStr, replaceStr);

fs.writeFileSync('components/dashboard/OffersManager.tsx', code);
console.log('Added scan count to offers manager.');
