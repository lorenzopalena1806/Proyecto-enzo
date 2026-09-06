const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

// 1. Remove the history section
const historySectionRegex = /\{\/\* Seccin: Mis Descuentos Usados \*\/\}[\s\S]*?<\/section>/g;
// Since there's an encoding issue with 'Seccin' possibly, let's use a simpler match
const matchHistorial = code.match(/\{\/\* Secci[^]*?Mis Descuentos Usados \*\/\}[\s\S]*?<\/section>/);
if (matchHistorial) {
  code = code.replace(matchHistorial[0], '');
} else {
  // Let's try matching the id="historial" section
  const idMatch = code.match(/\{\/\* [^\n]*? \*\/\}[\s\n]*<section id="historial"[\s\S]*?<\/section>/);
  if (idMatch) {
    code = code.replace(idMatch[0], '');
  }
}

// 2. Remove the data fetching for clientHistory
const dataFetchRegex = /\/\/ 2\. Fetch this client's transaction history[\s\S]*?const displayHistory = clientHistory \|\| \[\];/;
code = code.replace(dataFetchRegex, '');

// 3. Remove totalSaved logic
const totalSavedRegex = /const totalSaved = displayHistory.reduce[\s\S]*?\}, 0\);/;
code = code.replace(totalSavedRegex, 'const totalSaved = 0; // Se movió al historial');

// 4. Change the bottom nav link
code = code.replace(/href="#historial"/, 'href="/client/history"');

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Cleaned qr page');
