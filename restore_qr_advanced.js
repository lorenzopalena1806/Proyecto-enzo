const fs = require('fs');

const oldLines = fs.readFileSync('temp_qr.tsx', 'utf8').split('\\n');
const newLines = fs.readFileSync('app/client/qr/page.tsx', 'utf8').split('\\n');

// Find where main content starts in old file
const mainContentIdx = oldLines.findIndex(l => l.includes('Main Content'));
const mainEndIdx = oldLines.findIndex(l => l.includes('Secci') && l.includes('Mis Descuentos Usados'));

// The missing chunk is oldLines from mainContentIdx to mainEndIdx (exclusive)
const missingChunk = oldLines.slice(mainContentIdx, mainEndIdx).join('\\n');

// In newLines, find where Main Content is
const newMainIdx = newLines.findIndex(l => l.includes('Main Content'));
const newMainEnd = newLines.findIndex(l => l.includes('</main>'));

const finalCode = newLines.slice(0, newMainIdx).join('\\n') + '\\n      ' + missingChunk + '\\n      </main>\\n\\n      <ClientBottomNav />\\n    </div>\\n  );\\n}';

fs.writeFileSync('app/client/qr/page.tsx', finalCode);
console.log('Restored fully');
