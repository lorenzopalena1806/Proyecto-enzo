const fs = require('fs');

let code = fs.readFileSync('components/dashboard/OffersManager.tsx', 'utf8');

// Update state definition
code = code.replace(
  `image_url: '',\n    original_price`,
  `image_url: '',\n    image_display_mode: 'background',\n    image_position: 'object-center',\n    original_price`
);

code = code.replace(
  `image_url: offer.image_url || '',\n        original_price`,
  `image_url: offer.image_url || '',\n        image_display_mode: offer.image_display_mode || 'background',\n        image_position: offer.image_position || 'object-center',\n        original_price`
);

code = code.replace(
  `image_url: '',\n          original_price`,
  `image_url: '',\n          image_display_mode: 'background',\n          image_position: 'object-center',\n          original_price`
);

fs.writeFileSync('components/dashboard/OffersManager.tsx', code);
console.log('State updated');
