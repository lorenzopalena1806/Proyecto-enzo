const fs = require('fs');
let code = fs.readFileSync('components/dashboard/MerchantChart.tsx', 'utf8');

code = code.replace(
  `<div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">`,
  `<div className="h-64 w-full overflow-hidden min-w-0 max-w-full">
      <ResponsiveContainer width="99%" height="100%">`
);

fs.writeFileSync('components/dashboard/MerchantChart.tsx', code);
console.log('Fixed chart overflow');
