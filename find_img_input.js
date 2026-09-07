const fs = require('fs');
const code = fs.readFileSync('components/dashboard/OffersManager.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('name="image_url"'));
console.log(lines.slice(Math.max(0, idx - 10), idx + 20).join('\n'));
