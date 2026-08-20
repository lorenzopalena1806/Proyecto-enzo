const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('RedBeneficios') || content.includes('Red Beneficios') || content.includes('Red de Beneficios')) {
        content = content.replace(/RedBeneficios/g, 'Lazoo');
        content = content.replace(/Red Beneficios/g, 'Lazoo');
        content = content.replace(/Red de Beneficios/g, 'Lazoo');
        content = content.replace(/Red de Descuentos/g, 'Lazoo - Red de Descuentos');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(path.join(__dirname, '../app'));
replaceInDir(path.join(__dirname, '../components'));
console.log('Done.');
