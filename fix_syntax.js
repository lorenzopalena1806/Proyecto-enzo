const fs = require('fs');

let code = fs.readFileSync('app/about/page.tsx', 'utf8');

// I will just replace the entire metadata block to be safe.
const metadataBlock = `export const metadata = {
  title: 'Sobre Nosotros | Lazoo',
  description: 'Conoce la historia detrás de Lazoo, nuestra misión y el equipo que trabaja para revolucionar los beneficios.',
  alternates: { canonical: 'https://lazoo.com.ar/about' },
};`;

code = code.replace(/export const metadata = \{[\s\S]*?\};\n/, metadataBlock + '\n\n');

fs.writeFileSync('app/about/page.tsx', code);

// Now fix app/actions/offers.ts
let actionsCode = fs.readFileSync('app/actions/offers.ts', 'utf8');

const badLines = `  const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;
  const image_display_mode = (formData.get('image_display_mode') as string) || 'background';
  const image_position = (formData.get('image_position') as string) || 'object-center';
  const image_display_mode = (formData.get('image_display_mode') as string) || 'background';
  const image_position = (formData.get('image_position') as string) || 'object-center';
  const image_display_mode = (formData.get('image_display_mode') as string) || 'background';
  const image_position = (formData.get('image_position') as string) || 'object-center';`;

const goodLines = `  const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;
  const image_display_mode = (formData.get('image_display_mode') as string) || 'background';
  const image_position = (formData.get('image_position') as string) || 'object-center';`;

// I will use regex to replace all multiple occurrences.
// Actually, I can just replace `const image_display_mode` with nothing and rebuild it properly.
actionsCode = actionsCode.replace(/  const image_display_mode = \(formData\.get\('image_display_mode'\) as string\) \|\| 'background';\n/g, '');
actionsCode = actionsCode.replace(/  const image_position = \(formData\.get\('image_position'\) as string\) \|\| 'object-center';\n/g, '');

const insertLines = `  const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;
  const image_display_mode = (formData.get('image_display_mode') as string) || 'background';
  const image_position = (formData.get('image_position') as string) || 'object-center';\n`;

actionsCode = actionsCode.replace(/  const image_url = image_url_raw && image_url_raw.startsWith\('http'\) \? image_url_raw : null;\n/g, insertLines);

fs.writeFileSync('app/actions/offers.ts', actionsCode);

console.log('Fixed both');
