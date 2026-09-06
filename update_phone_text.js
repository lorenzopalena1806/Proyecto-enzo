const fs = require('fs');
let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

const oldText = `<p className="text-xs text-slate-500 mt-1">Este número es privado para Lazoo. El teléfono público se configura en <b>Mis Sucursales</b>.</p>`;
const newText = `<p className="text-xs text-slate-500 mt-1">Este número es privado para Lazoo.</p>`;

if (!code.includes(oldText)) {
  console.error("Text not found!");
  process.exit(1);
}

code = code.replace(oldText, newText);
fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log("Successfully updated text in ProfileEditForm.tsx");
