const fs = require('fs');
let code = fs.readFileSync('components/client/ClientBottomNav.tsx', 'utf8');

code = code.replace(/\\`/g, '`');

fs.writeFileSync('components/client/ClientBottomNav.tsx', code);
console.log('Fixed backticks in client nav');
