const fs = require('fs');
let code = fs.readFileSync('components/client/ClientBottomNav.tsx', 'utf8');

code = code.replace(
  `{/* Left: Historial */}
        <Link`,
  `{/* Left: Historial */}
        <Link id="tour-client-history"`
);

code = code.replace(
  `{/* Center: QR Scanner (Floating) */}
        <div className="relative -top-6">`,
  `{/* Center: QR Scanner (Floating) */}
        <div id="tour-client-scan" className="relative -top-6">`
);

fs.writeFileSync('components/client/ClientBottomNav.tsx', code);
console.log('Added nav IDs');
