const fs = require('fs');
let code = fs.readFileSync('app/client/merchant/[id]/page.tsx', 'utf8');

// Replace the Hero Header banner image logic
const oldHero = `{/* Hero Header */}
      <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
        {merchant.avatar_url ? (
          <>
            <Image 
              src={merchant.avatar_url} 
              alt={merchant.business_name || 'Portada'} 
              fill 
              className="object-cover opacity-60" 
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/20"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-blue-600/30"></div>
        )}`;

const newHero = `{/* Hero Header */}
      <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
        {(merchant.banner_url || merchant.avatar_url) ? (
          <>
            <Image 
              src={merchant.banner_url || merchant.avatar_url} 
              alt={merchant.business_name || 'Portada'} 
              fill 
              className={\`object-cover \${merchant.banner_url ? 'opacity-90' : 'opacity-50 blur-[2px]'}\`}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/20"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-blue-600/30"></div>
        )}`;

if (!code.includes(oldHero)) {
  console.error("Could not find oldHero in app/client/merchant/[id]/page.tsx");
  process.exit(1);
}

code = code.replace(oldHero, newHero);
fs.writeFileSync('app/client/merchant/[id]/page.tsx', code);
console.log('Successfully updated app/client/merchant/[id]/page.tsx to use banner_url!');
