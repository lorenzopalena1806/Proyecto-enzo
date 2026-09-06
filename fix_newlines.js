const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

code = code.replace(/\\n/g, '\n');

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Fixed newlines');
