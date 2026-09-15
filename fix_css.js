const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

const styleRegex = /<style>\{`([\s\S]*?)`\}<\/style>/;
const match = code.match(styleRegex);

if (match && match[1]) {
  const css = match[1];
  let globals = fs.readFileSync('app/globals.css', 'utf8');
  globals = globals.replace('@layer components {', '@layer components {\n' + css + '\n');
  fs.writeFileSync('app/globals.css', globals);
  
  code = code.replace(styleRegex, '');
  fs.writeFileSync('app/client/qr/page.tsx', code);
  console.log('Moved CSS to globals.css');
} else {
  console.log('No style tag found');
}
