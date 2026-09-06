const fs = require('fs');
let code = fs.readFileSync('app/client/merchant/[id]/page.tsx', 'utf8');

// The banner currently is an Image component with avatar_url
// <Image src={merchant.avatar_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'}

code = code.replace(
  `<Image 
          src={merchant.avatar_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'}`,
  `<Image 
          src={merchant.banner_url || merchant.avatar_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'}`
);

fs.writeFileSync('app/client/merchant/[id]/page.tsx', code);
console.log('Fixed merchant banner image in profile view');
