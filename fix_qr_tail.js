const fs = require('fs');
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

const clientNavIndex = code.indexOf('<ClientBottomNav />');
if (clientNavIndex !== -1) {
  code = code.substring(0, clientNavIndex + '<ClientBottomNav />'.length);
  code += `\n    </div>\n  );\n}\n`;
}

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('Fixed qr page tail');
