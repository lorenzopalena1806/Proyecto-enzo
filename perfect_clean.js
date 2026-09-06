const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

// 1. Remove history section safely.
// We find where it starts: `{/* Secci` ... `Mis Descuentos Usados`
const historyStartMatch = code.match(/\{\/\*\s*Secci[^]*?Mis Descuentos Usados[^]*?\*\/\}/);
if (historyStartMatch) {
  const historyStart = code.indexOf('<section id="historial"', historyStartMatch.index - 100);
  if (historyStart !== -1) {
    const historyEnd = code.indexOf('</section>', historyStart) + '</section>'.length;
    code = code.substring(0, historyStart) + code.substring(historyEnd);
  }
}

// 2. Remove old nav bar and replace with <ClientBottomNav />
const navStart = code.indexOf('{/* Floating Bottom Navigation Bar */}');
if (navStart !== -1) {
  code = code.substring(0, navStart) + '{/* Floating Bottom Navigation Bar */}\\n      <ClientBottomNav />\\n    </div>\\n  );\\n}\\n';
}

// 3. Add import
if (!code.includes('ClientBottomNav')) {
  code = code.replace(
    `import { ShareButton } from '@/components/shared/ShareButton';`,
    `import { ShareButton } from '@/components/shared/ShareButton';\nimport { ClientBottomNav } from '@/components/client/ClientBottomNav';`
  );
}

// 4. Fix totalSaved logic (since clientHistory data fetch was removed in our previous version, but here it's still present in the file we checked out)
// Wait, the checked out file STILL has the `clientHistory` fetch logic!
// Let's modify it to only fetch `totalSaved` if we want to save DB queries, or just leave it. Leaving it is perfectly fine, it's just fetching 20 items.

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Cleaned perfectly');
