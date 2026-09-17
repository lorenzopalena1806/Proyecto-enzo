const fs = require('fs');
let code = fs.readFileSync('components/dashboard/Sidebar.tsx', 'utf8');

// Remove PRO badge from Ventas
code = code.replace("    badge: 'PRO',\n    id: 'tour-history',", "    id: 'tour-history',");

// Remove PRO badge from Mis Sucursales
code = code.replace("    badge: 'PRO',\n    id: 'tour-branches',", "    id: 'tour-branches',");

// Remove the entire "Planes y Suscripción" nav item  
code = code.replace(`  {
    href: '/dashboard/pro',
    label: 'Planes y Suscripción',
    icon: Crown,
    exact: false,
    id: 'tour-pro',
    badge: 'PRO',
  },`, '');

fs.writeFileSync('components/dashboard/Sidebar.tsx', code);
console.log('Sidebar fixed!');
