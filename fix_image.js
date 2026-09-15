const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

if (!code.includes("import Image from 'next/image';")) {
  code = code.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';");
}

code = code.replace(
  '<img src="/logo.png" alt="Lazoo" className="w-24 opacity-80" />',
  '<Image src="/logo.png" alt="Lazoo" width={96} height={32} className="w-24 opacity-80" priority />'
);

code = code.replace(
  '<img src="/logo.png" alt="Lazoo Logo" className="w-8 h-8 rounded-full border border-white/20" />',
  '<Image src="/logo.png" alt="Lazoo Logo" width={32} height={32} className="w-8 h-8 rounded-full border border-white/20" />'
);

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Fixed Image component');
