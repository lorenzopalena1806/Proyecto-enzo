const fs = require('fs');

let code = fs.readFileSync('app/about/page.tsx', 'utf8');

if (!code.includes('alternates:')) {
  // Try finding 'description: '
  const descIdx = code.indexOf('description: ');
  if (descIdx !== -1) {
    const endOfDesc = code.indexOf(',', descIdx);
    if (endOfDesc !== -1) {
      code = code.substring(0, endOfDesc + 1) + "\n  alternates: { canonical: 'https://lazoo.com.ar/about' }," + code.substring(endOfDesc + 1);
      fs.writeFileSync('app/about/page.tsx', code);
      console.log('Added metadata to about page');
    }
  }
}
