const fs = require('fs');
let code = fs.readFileSync('components/dashboard/HistoryTableClient.tsx', 'utf8');

const tableBlockStart = `<div className="overflow-x-auto">
            <table className="w-full text-left text-sm">`;

const replaceWith = `<div className="w-full">
            {/* Mobile View (Cards) */}
            <div className="md:hidden divide-y divide-slate-800/50">
              {filteredAndSortedTxs.map((tx: any) => {
                const scannedUser = tx.scanned_user as { full_name?: string; business_name?: string; role?: string } | null;
                const offer = tx.offer as { title?: string } | null;
                const clientName = scannedUser?.business_name || scannedUser?.full_name || 'Usuario';
                const saved = (tx.original_amount || 0) - (tx.final_amount || 0);
                
                return (
                  <div key={tx.id} className={\`p-4 space-y-3 \${tx.status === 'cancelled' ? 'opacity-50' : ''}\`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className={\`font-bold \${tx.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-white'}\`}>{clientName}</div>
                        <div className="text-xs text-slate-500 capitalize">{scannedUser?.role === 'merchant' ? 'Comercio' : 'Cliente'}</div>
                      </div>
                      <div className="text-right">
                        <span className={\`font-black text-lg \${tx.status === 'cancelled' ? 'text-slate-500' : 'text-emerald-400'}\`}>
                          {tx.final_amount ? fmt(tx.final_amount) : '---'}
                        </span>
                        {tx.original_amount && (
                          <div className="text-xs text-slate-500 line-through">{fmt(tx.original_amount)}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-sm text-slate-300 truncate mr-2">{offer?.title || 'Descuento general'}</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Ahorro: {fmt(saved)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="text-xs text-slate-500">
                        {new Date(tx.applied_at).toLocaleString('es-AR', {
                          day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                      <UndoChargeButton 
                        transactionId={tx.id} 
                        isRecent={new Date(tx.applied_at).getTime() > Date.now() - 24 * 60 * 60 * 1000}
                        isCancelled={tx.status === 'cancelled'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View (Table) */}
            <table className="hidden md:table w-full text-left text-sm">`;

code = code.replace(tableBlockStart, replaceWith);

// Let's also check if the stats grid is doing weird things on mobile.
// In page.tsx:
// <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
// This means 2 columns on mobile. We can make it grid-cols-1 sm:grid-cols-2 lg:grid-cols-4.

fs.writeFileSync('components/dashboard/HistoryTableClient.tsx', code);
console.log('Fixed History table mobile layout.');
