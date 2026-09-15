const fs = require('fs');
let code = fs.readFileSync('app/actions/employee.ts', 'utf8');
code = code.replace(
  "const { processPaymentByShortCodeServer } = await import('./charge');",
  "const { internalProcessPaymentByShortCode } = await import('./charge');"
);
code = code.replace(
  "const paymentRes = await processPaymentByShortCodeServer(",
  "const paymentRes = await internalProcessPaymentByShortCode("
);
fs.writeFileSync('app/actions/employee.ts', code);
console.log('Fixed employee.ts');
