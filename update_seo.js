const fs = require('fs');

// Update sitemap.ts
let sitemap = fs.readFileSync('app/sitemap.ts', 'utf8');
sitemap = sitemap.replace(/\{\s*url:\s*\`\$\{baseUrl\}\/auth\/login\`[\s\S]*?\},/g, '');
sitemap = sitemap.replace(/\{\s*url:\s*\`\$\{baseUrl\}\/auth\/register\`[\s\S]*?\},/g, '');
fs.writeFileSync('app/sitemap.ts', sitemap);

// Update robots.ts
let robots = fs.readFileSync('app/robots.ts', 'utf8');
robots = robots.replace(
  `disallow: ['/dashboard/', '/admin/', '/api/', '/suspended/', '/subscription-required/'],`,
  `disallow: ['/dashboard/', '/admin/', '/api/', '/suspended/', '/subscription-required/', '/auth/'],`
);
fs.writeFileSync('app/robots.ts', robots);

console.log('Updated sitemap and robots');
