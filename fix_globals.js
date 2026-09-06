const fs = require('fs');
let code = fs.readFileSync('app/globals.css', 'utf8');

code = code.replace(
  `html {
  scroll-behavior: smooth;
}`,
  `html, body {
  scroll-behavior: smooth;
  overflow-x: hidden;
  max-width: 100vw;
  width: 100%;
}`
);

fs.writeFileSync('app/globals.css', code);
console.log('Added global overflow-x hidden');
