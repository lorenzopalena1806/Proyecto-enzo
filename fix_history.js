const fs = require('fs');
let code = fs.readFileSync('app/dashboard/history/page.tsx', 'utf8');

const statsToReplace = `{/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <Receipt className="h-5 w-5 text-violet-400" />
          <p className="text-2xl font-bold text-white">{totalTx}</p>
          <p className="text-xs text-slate-400">Transacciones totales</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <Users className="h-5 w-5 text-blue-400" />
          <p className="text-2xl font-bold text-white">{uniqueClients}</p>
          <p className="text-xs text-slate-400">Clientes únicos</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          <p className="text-2xl font-bold text-white">{fmt(totalRevenue)}</p>
          <p className="text-xs text-slate-400">Facturación total</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <TrendingUp className="h-5 w-5 text-amber-400" />
          <p className="text-2xl font-bold text-white">{fmt(totalDiscounted)}</p>
          <p className="text-xs text-slate-400">Total ahorrado por clientes</p>
        </div>
      </div>

      {/* Gráfico de Escaneos */}
      <div className="glass-panel rounded-2xl p-6 shadow-lg">
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Escaneos últimos 7 Días
        </h2>
        <MerchantChart data={chartData} />
      </div>`;

const newStats = `{/* Stats & Gráfico (Bloqueados si es Basic) */}
      <div className="relative">
        {isBasic && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md rounded-2xl border border-slate-800/50">
            <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Estadísticas Bloqueadas</h3>
            <p className="text-slate-400 text-sm max-w-sm text-center mb-4">
              Las métricas detalladas y gráficos de escaneos están disponibles solo en el Plan PRO.
            </p>
            <a href="/dashboard/pro" className="bg-white hover:bg-slate-200 text-slate-900 font-bold py-2 px-6 rounded-xl transition-colors">
              Mejorar Plan
            </a>
          </div>
        )}

        <div className={\`space-y-6 \${isBasic ? 'opacity-20 pointer-events-none blur-sm' : ''}\`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <Receipt className="h-5 w-5 text-violet-400" />
              <p className="text-2xl font-bold text-white">{totalTx}</p>
              <p className="text-xs text-slate-400">Transacciones totales</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <Users className="h-5 w-5 text-blue-400" />
              <p className="text-2xl font-bold text-white">{uniqueClients}</p>
              <p className="text-xs text-slate-400">Clientes únicos</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <p className="text-2xl font-bold text-white">{fmt(totalRevenue)}</p>
              <p className="text-xs text-slate-400">Facturación total</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <p className="text-2xl font-bold text-white">{fmt(totalDiscounted)}</p>
              <p className="text-xs text-slate-400">Total ahorrado por clientes</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 shadow-lg">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Escaneos últimos 7 Días
            </h2>
            <MerchantChart data={chartData} />
          </div>
        </div>
      </div>`;

// Note: special characters like ó, ú might have different encodings in the file read by node.
// To avoid strict string matching failures, I will use regex or search for fragments.

code = code.replace(/\{\/\* Stats \*\/\}[\s\S]*?MerchantChart data=\{chartData\} \/>\s*<\/div>/, newStats);

fs.writeFileSync('app/dashboard/history/page.tsx', code);
console.log('Fixed history page stats blur.');
