const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

// 1. Remove history section safely
const startStr = '        {/* Secci'; // Start of Mis Descuentos Usados (note encoding differences)
const endStr = '      </main>';

const startIdx = code.indexOf(startStr, code.indexOf('<DiscoverSection'));
if (startIdx !== -1) {
  const endIdx = code.indexOf(endStr, startIdx);
  if (endIdx !== -1) {
    code = code.substring(0, startIdx) + '\\n      </main>' + code.substring(endIdx + endStr.length);
  }
}

// 2. Remove old nav bar
const navStart = code.indexOf('{/* Floating Bottom Navigation Bar */}');
if (navStart !== -1) {
  code = code.substring(0, navStart) + '\\n      <ClientBottomNav />\\n    </div>\\n  );\\n}\\n';
}

// 3. Add import
if (!code.includes('ClientBottomNav')) {
  code = code.replace(
    `import { ShareButton } from '@/components/shared/ShareButton';`,
    `import { ShareButton } from '@/components/shared/ShareButton';\\nimport { ClientBottomNav } from '@/components/client/ClientBottomNav';`
  );
}

// Fix backslashes introduced by string interpolation if any
code = code.replace(/\\\\n/g, '\\n');

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Cleaned securely');
