const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

if (!code.includes('export const metadata')) {
  code = code.replace(
    `export const dynamic = 'force-dynamic';`,
    `export const dynamic = 'force-dynamic';\n\nexport const metadata = {\n  alternates: {\n    canonical: 'https://lazoo.com.ar',\n  },\n};\n`
  );
  fs.writeFileSync('app/page.tsx', code);
  console.log('Added metadata to page.tsx');
}
