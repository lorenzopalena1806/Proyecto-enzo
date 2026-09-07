const fs = require('fs');

let code = fs.readFileSync('app/actions/offers.ts', 'utf8');

// Update createOffer extraction
const imgUrlTargetCreate = `const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;`;
const imgOptionsExtract = `\n  const image_display_mode = (formData.get('image_display_mode') as string) || 'background';\n  const image_position = (formData.get('image_position') as string) || 'object-center';`;
if (code.includes(imgUrlTargetCreate) && !code.includes('image_display_mode =')) {
  code = code.replace(imgUrlTargetCreate, imgUrlTargetCreate + imgOptionsExtract);
}

// Update createOffer insert
const insertTarget = `    image_url,
    stock_limit,
    valid_days,`;
const insertReplacement = `    image_url,
    image_display_mode,
    image_position,
    stock_limit,
    valid_days,`;
if (code.includes(insertTarget)) {
  code = code.replace(insertTarget, insertReplacement);
}

// Update updateOffer extraction
const imgUrlTargetUpdate = `const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;`;
// Wait, we replaced it globally? Let's check carefully.
code = code.replace(
  `const image_url_raw = formData.get('image_url') as string;\n  const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;`,
  `const image_url_raw = formData.get('image_url') as string;\n  const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;\n  const image_display_mode = (formData.get('image_display_mode') as string) || 'background';\n  const image_position = (formData.get('image_position') as string) || 'object-center';`
);

// We need to update the `update` call in `updateOffer`.
const updateTarget = `    image_url,
    stock_limit,
    valid_days
  })`;
const updateReplacement = `    image_url,
    image_display_mode,
    image_position,
    stock_limit,
    valid_days
  })`;
if (code.includes(updateTarget)) {
  code = code.replace(updateTarget, updateReplacement);
}

fs.writeFileSync('app/actions/offers.ts', code);
console.log('Done updating backend');
