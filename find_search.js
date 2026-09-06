const fs = require('fs');
const lines = fs.readFileSync('components/client/DiscoverSection.tsx', 'utf8').split('\n');
const searchIdx = lines.findIndex(l => l.includes('placeholder="Buscar'));
console.log(lines.slice(Math.max(0, searchIdx - 20), searchIdx + 20).join('\n'));
