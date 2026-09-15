const fs = require('fs');
let code = fs.readFileSync('app/client/scanner/page.tsx', 'utf8');

const targetImport = `import { ClientScanner } from '@/components/client/ClientScanner';`;
const replaceImport = `import dynamic from 'next/dynamic';\nconst ClientScanner = dynamic(() => import('@/components/client/ClientScanner').then(mod => mod.ClientScanner), { ssr: false, loading: () => <div className="animate-pulse bg-slate-900 rounded-2xl h-80 flex items-center justify-center text-slate-500 border border-slate-800">Cargando cámara...</div> });`;

code = code.replace(targetImport, replaceImport);
fs.writeFileSync('app/client/scanner/page.tsx', code);
console.log('Fixed scanner lazy load');
