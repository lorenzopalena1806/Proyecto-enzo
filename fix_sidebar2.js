const fs = require('fs');
let code = fs.readFileSync('components/dashboard/Sidebar.tsx', 'utf8');

// Replace Ventas object to add badge
code = code.replace(
  `{
    href: '/dashboard/history',
    label: 'Ventas',
    icon: History,
    exact: false,
    id: 'tour-history',
  }`,
  `{
    href: '/dashboard/history',
    label: 'Ventas',
    icon: History,
    exact: false,
    badge: 'PRO',
    id: 'tour-history',
  }`
);

// Delete the lock icon svg logic entirely
code = code.replace(
  /\{\s*item\.href === '\/dashboard\/history' && profile\?\.plan_type === 'basic' && \(\s*<svg className="w-4 h-4 ml-auto text-amber-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" \/><\/svg>\s*\)\s*\}/,
  ""
);

fs.writeFileSync('components/dashboard/Sidebar.tsx', code);
console.log("Sidebar lock removed, PRO badge added to Ventas.");
