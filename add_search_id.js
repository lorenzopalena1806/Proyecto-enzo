const fs = require('fs');
let code = fs.readFileSync('components/client/DiscoverSection.tsx', 'utf8');

code = code.replace(
  `<div className="flex gap-3">
        <div className="relative flex-1">`,
  `<div id="tour-client-search" className="flex gap-3 relative z-[1]">
        <div className="relative flex-1">`
);

fs.writeFileSync('components/client/DiscoverSection.tsx', code);
console.log('Added tour-client-search id');
