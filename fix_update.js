const fs = require('fs');

let code = fs.readFileSync('app/actions/offers.ts', 'utf8');

const imgUrlRawSearch = `  const image_url_raw = formData.get('image_url') as string;\n  const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;`;
const imgUrlRawReplace = `  const image_url_raw = formData.get('image_url') as string;\n  const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;\n  const image_display_mode = (formData.get('image_display_mode') as string) || 'background';\n  const image_position = (formData.get('image_position') as string) || 'object-center';`;

// Apply everywhere just in case, using split/join to replace all occurrences.
code = code.split(imgUrlRawSearch).join(imgUrlRawReplace);

// We also need to fix the second update call in `updateOffer`
const updateInsert = `    image_url,
    stock_limit,
    valid_days
  })`;
const updateInsertReplace = `    image_url,
    image_display_mode,
    image_position,
    stock_limit,
    valid_days
  })`;
code = code.split(updateInsert).join(updateInsertReplace);

fs.writeFileSync('app/actions/offers.ts', code);
console.log('Done fixing updateOffer');
