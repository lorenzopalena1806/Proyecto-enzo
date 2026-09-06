const fs = require('fs');
let code = fs.readFileSync('app/client/profile/page.tsx', 'utf8');

code = code.replace(
  `<RestartTutorialButton userId={user.id} />`,
  `<RestartTutorialButton userId={user.id} redirectUrl="/client/qr" text="Ver Tutorial de la App" />`
);

fs.writeFileSync('app/client/profile/page.tsx', code);
console.log('Updated profile usage');
