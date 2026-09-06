const fs = require('fs');
let code = fs.readFileSync('app/client/history/page.tsx', 'utf8');

const targetHeader = `<header className="px-4 py-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Lazoo" className="h-7 w-auto object-contain" />
        </div>`;

const replaceHeader = `<header className="px-4 py-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/client/qr" className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <img src="/logo.png" alt="Lazoo" className="h-6 w-auto object-contain" />
        </div>`;

code = code.replace(targetHeader, replaceHeader);

if (!code.includes('import Link')) {
  code = code.replace(`import React from 'react';`, `import React from 'react';\nimport Link from 'next/link';\nimport { ChevronLeft } from 'lucide-react';`);
}

fs.writeFileSync('app/client/history/page.tsx', code);
console.log('Added back button to history page header');
