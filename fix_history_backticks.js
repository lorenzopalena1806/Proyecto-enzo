const fs = require('fs');
let code = fs.readFileSync('app/client/history/page.tsx', 'utf8');

code = code.replace(/\\`/g, '`');

fs.writeFileSync('app/client/history/page.tsx', code);
console.log('Fixed backticks in history page');
