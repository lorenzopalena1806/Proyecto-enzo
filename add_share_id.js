const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

code = code.replace(
  `<ShareButton className="text-xs text-blue-400 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg font-semibold" />`,
  `<div id="tour-client-share"><ShareButton className="text-xs text-blue-400 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg font-semibold" /></div>`
);

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Added share ID');
