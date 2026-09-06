const fs = require('fs');
let code = fs.readFileSync('app/dashboard/scanner/page.tsx', 'utf8');

const target = /<div className="space-y-6">[\s\S]*?<div>[\s\S]*?<h1 className="text-2xl font-bold text-white">Generar Cobro<\/h1>[\s\S]*?<\/div>/;
const replace = `<div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Generar Cobro</h1>
          <p className="text-slate-400 mt-1">
            Ingresá el monto y seleccioná el método de pago para cobrar con descuento.
          </p>
        </div>
      </div>`;

code = code.replace(target, replace);
fs.writeFileSync('app/dashboard/scanner/page.tsx', code);
console.log('Fixed dashboard scanner');
