const fs = require('fs');
let code = fs.readFileSync('app/dashboard/scanner/page.tsx', 'utf8');

if (!code.includes('ChevronLeft')) {
  code = code.replace(
    `import { redirect } from 'next/navigation';`,
    `import { redirect } from 'next/navigation';\nimport Link from 'next/link';\nimport { ChevronLeft } from 'lucide-react';`
  );
  
  code = code.replace(
    `    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Generar Cobro</h1>`,
    `    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Generar Cobro</h1>`
  );
  
  // Close the div we opened around h1/p
  code = code.replace(
    `automǭticamente.
        </p>
      </div>`,
    `automáticamente.
        </p>
        </div>
      </div>`
  );
  
  fs.writeFileSync('app/dashboard/scanner/page.tsx', code);
  console.log('Added back button to dashboard scanner');
}
