const fs = require('fs');
let code = fs.readFileSync('app/dashboard/history/page.tsx', 'utf8');

code = code.replace(
  `return (
    <div className="space-y-6">
      {/* Header */}`,
  `return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}`
);

fs.writeFileSync('app/dashboard/history/page.tsx', code);
console.log('Fixed page overflow');
