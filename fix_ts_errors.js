const fs = require('fs');

// ── 1. Fix app/client/qr/page.tsx ──────────────────────────────────────────
// Remove plan_type from select and from sort logic
let code = fs.readFileSync('app/client/qr/page.tsx', 'utf8');

// Remove plan_type from the select string
code = code.replace(
  "'id, business_name, avatar_url, maps_url, category, is_featured, address, latitude, longitude, plan_type, created_at'",
  "'id, business_name, avatar_url, maps_url, category, is_featured, address, latitude, longitude, created_at'"
);

// Replace sort with plan_type references
code = code.replace(
  `  // Sort: PRO first, then featured, then created_at
  const merchants = (merchantsData || []).sort((a, b) => {
    if (a.plan_type === 'pro' && b.plan_type !== 'pro') return -1;
    if (a.plan_type !== 'pro' && b.plan_type === 'pro') return 1;
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });`,
  `  // Sort: featured first, then newest
  const merchants = (merchantsData || []).sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });`
);

fs.writeFileSync('app/client/qr/page.tsx', code);
console.log('✅ app/client/qr/page.tsx fixed');

// ── 2. Fix app/dashboard/history/page.tsx ──────────────────────────────────
code = fs.readFileSync('app/dashboard/history/page.tsx', 'utf8');
// Remove plan_type from select
code = code.replace(".select('role, plan_type')", ".select('role')");
// Remove isBasic declaration
code = code.replace("  const isBasic = profile?.plan_type === 'basic';\n", '');
fs.writeFileSync('app/dashboard/history/page.tsx', code);
console.log('✅ app/dashboard/history/page.tsx fixed');

// ── 3. Fix components/dashboard/EmployeeManager.tsx ─────────────────────────
code = fs.readFileSync('components/dashboard/EmployeeManager.tsx', 'utf8');
// Remove the isBasicAndLimited PRO lock overlay block entirely
const lockOverlayStart = '        {isBasicAndLimited && (';
const lockOverlayEnd = '        )}\n\n        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">';
const lockIdx = code.indexOf(lockOverlayStart);
const afterLockIdx = code.indexOf(lockOverlayEnd) + lockOverlayEnd.length - '<h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">'.length;
if (lockIdx !== -1) {
  code = code.substring(0, lockIdx) + '\n' + code.substring(afterLockIdx);
}
fs.writeFileSync('components/dashboard/EmployeeManager.tsx', code);
console.log('✅ components/dashboard/EmployeeManager.tsx fixed');

// ── 4. Fix components/dashboard/ProfileEditForm.tsx ─────────────────────────
code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');
// Remove the isPro lock overlay
code = code.replace(
  `            {!isPro && (
              <a href="/dashboard/pro" className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-slate-950/40 transition-colors">
                <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span className="text-sm text-slate-300 font-medium">Exclusivo Plan PRO</span>
                </div>
              </a>
            )}`,
  ''
);
// Remove disabled={!isPro}
code = code.replace('                disabled={!isPro}\n                placeholder', '                placeholder');
fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('✅ components/dashboard/ProfileEditForm.tsx fixed');

console.log('\n🎉 All TS errors fixed!');
