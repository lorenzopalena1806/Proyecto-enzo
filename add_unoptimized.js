const fs = require('fs');
let code = fs.readFileSync('app/client/merchant/[id]/page.tsx', 'utf8');

code = code.replace(
  `priority
            />`,
  `priority
              unoptimized
            />`
);

code = code.replace(
  `<Image src={merchant.avatar_url} alt="Logo" fill className="object-cover" />`,
  `<Image src={merchant.avatar_url} alt="Logo" fill className="object-cover" unoptimized />`
);

fs.writeFileSync('app/client/merchant/[id]/page.tsx', code);
console.log('Added unoptimized to images in merchant page');
