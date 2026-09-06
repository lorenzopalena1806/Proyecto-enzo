const fs = require('fs');
let code = fs.readFileSync('components/dashboard/Sidebar.tsx', 'utf8');

// Remove the lock icon logic
code = code.replace(
  `{item.href === '/dashboard/history' && profile?.plan_type === 'basic' && (
                <svg className="w-4 h-4 ml-auto text-amber-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              )}`,
  ''
);
// Fix the chevron right that had item.href !== '/dashboard/history' in its condition
code = code.replace(
  `{active && !item.badge && item.href !== '/dashboard/history' && <ChevronRight className="h-3 w-3 ml-auto" />}`,
  `{active && !item.badge && <ChevronRight className="h-3 w-3 ml-auto" />}`
);

fs.writeFileSync('components/dashboard/Sidebar.tsx', code);
console.log('Fixed Sidebar.');
