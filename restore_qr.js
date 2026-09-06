const fs = require('fs');
const oldCode = fs.readFileSync('temp_qr.tsx', 'utf8');
let currentCode = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

// The missing part is from `        {/* Secci` to `<DiscoverSection ... />`
// Let's find the exact block in oldCode
const mainContentStart = oldCode.indexOf('{/* Secci');
const mainContentEnd = oldCode.indexOf('{/* Secci', mainContentStart + 10); // This is where Mis Descuentos Usados starts
// wait, the actual DiscoverSection is right before "Mis Descuentos Usados"
const discoverEnd = oldCode.indexOf('{/* Secci', oldCode.indexOf('<DiscoverSection'));

const missingContent = oldCode.substring(mainContentStart, discoverEnd);

// Let's inject it back into currentCode
currentCode = currentCode.replace(
  `<main className="flex-1 flex flex-col p-4 space-y-8 max-w-lg mx-auto w-full pt-8 pb-24 relative z-10">
        
        

      </main>`,
  `<main className="flex-1 flex flex-col p-4 space-y-8 max-w-lg mx-auto w-full pt-8 pb-24 relative z-10">\n        ${missingContent}\n      </main>`
);

fs.writeFileSync('app/client/qr/page.tsx', currentCode);
console.log('Restored missing content');
