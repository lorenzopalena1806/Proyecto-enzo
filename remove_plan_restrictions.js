const fs = require('fs');

// ─────────────────────────────────────────────
// 1. BranchManager.tsx — Remove branch limit
// ─────────────────────────────────────────────
let code = fs.readFileSync('components/dashboard/BranchManager.tsx', 'utf8');

// Remove planType param, default to unlimited
code = code.replace(
  `export function BranchManager({ branches, planType = 'basic' }: { branches: Branch[], planType?: string }) {`,
  `export function BranchManager({ branches }: { branches: Branch[] }) {`
);

// Remove isBasicAndLimited logic
code = code.replace(
  `  const isBasicAndLimited = planType === 'basic' && branches.length >= 1;\n\n`,
  ''
);

// Remove guard in handleSubmit
code = code.replace(
  `      if (isBasicAndLimited) {
        setErrorMsg('El Plan Básico permite máximo 1 sucursal.');
        setIsLoading(false);
        return;
      }
      const result = await createBranchAction(formData);`,
  `      const result = await createBranchAction(formData);`
);

// Remove guard in button click and simplify button
code = code.replace(
  `            onClick={() => {
              if (isBasicAndLimited) {
                alert('El Plan Básico permite máximo 1 sucursal. Mejorá tu plan a PRO para agregar más sucursales.');
                return;
              }
              setEditingBranch(null);
              setBusinessHours('');
              setIsModalOpen(true);
            }}
            className={\`font-bold py-2 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 \${
              isBasicAndLimited 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-violet-600 hover:bg-violet-500 text-white'
            }\`}`,
  `            onClick={() => {
              setEditingBranch(null);
              setBusinessHours('');
              setIsModalOpen(true);
            }}
            className="font-bold py-2 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 bg-violet-600 hover:bg-violet-500 text-white"`
);

fs.writeFileSync('components/dashboard/BranchManager.tsx', code);
console.log('✅ BranchManager.tsx fixed');

// ─────────────────────────────────────────────
// 2. EmployeeManager.tsx — Remove employee limit
// ─────────────────────────────────────────────
code = fs.readFileSync('components/dashboard/EmployeeManager.tsx', 'utf8');

code = code.replace(
  `  employees, 
  branches,
  baseUrl,
  planType = 'basic'
}: { 
  employees: any[]; 
  branches: any[];
  baseUrl: string;
  planType?: string;
}`,
  `  employees, 
  branches,
  baseUrl,
}: { 
  employees: any[]; 
  branches: any[];
  baseUrl: string;
}`
);

code = code.replace(
  `  const isBasicAndLimited = planType === 'basic' && employees.length >= 0;\n\n`,
  ''
);

code = code.replace(
  `  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBasicAndLimited) {
      alert('El Plan Básico no permite crear cajeros. Mejorá tu plan a PRO para gestionar empleados.');
      return;
    }
    setIsCreating(true);`,
  `  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);`
);

// Remove isBasicAndLimited banner and disable on button
code = code.replace(/\s*\{isBasicAndLimited &&[\s\S]*?\}\s*(?=\s*\{\/\*)/m, '\n\n');
code = code.replace('disabled={isCreating || isBasicAndLimited}', 'disabled={isCreating}');

fs.writeFileSync('components/dashboard/EmployeeManager.tsx', code);
console.log('✅ EmployeeManager.tsx fixed');

// ─────────────────────────────────────────────
// 3. app/dashboard/branches/page.tsx — Remove plan_type fetch
// ─────────────────────────────────────────────
code = fs.readFileSync('app/dashboard/branches/page.tsx', 'utf8');

code = code.replace(
  `  const { data: profile } = await adminClient.from('profiles').select('role, plan_type').eq('id', user.id).single();\n`,
  `  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();\n`
);

code = code.replace(
  `      <BranchManager branches={branches || []} planType={profile.plan_type || 'basic'} />`,
  `      <BranchManager branches={branches || []} />`
);

fs.writeFileSync('app/dashboard/branches/page.tsx', code);
console.log('✅ branches/page.tsx fixed');

// ─────────────────────────────────────────────
// 4. app/dashboard/employee/page.tsx — Remove plan_type fetch
// ─────────────────────────────────────────────
code = fs.readFileSync('app/dashboard/employee/page.tsx', 'utf8');

code = code.replace(
  `  const { data: profile } = await adminClient.from('profiles').select('plan_type').eq('id', user.id).single();\n`,
  `  const { data: profile } = await adminClient.from('profiles').select('id').eq('id', user.id).single();\n`
);

code = code.replace(
  `        planType={profile?.plan_type || 'basic'}`,
  ''
);

fs.writeFileSync('app/dashboard/employee/page.tsx', code);
console.log('✅ employee/page.tsx fixed');

// ─────────────────────────────────────────────
// 5. app/dashboard/history/page.tsx — Remove isBasic gate
// ─────────────────────────────────────────────
code = fs.readFileSync('app/dashboard/history/page.tsx', 'utf8');

// Remove plan_type from select
code = code.replace(
  `    .select('role, plan_type')`,
  `    .select('role')`
);

// Remove isBasic constant
code = code.replace(
  `  const isBasic = profile?.plan_type === 'basic';\n\n`,
  ''
);

// Replace the isBasic ? <upsell> : <LazooInsights> block with just <LazooInsights>
code = code.replace(
  /\s*\{isBasic \? \(\s*<div className="bg-gradient-to-r[\s\S]*?\) : \(\s*<LazooInsights merchantId=\{user\.id\} \/>\s*\)\}/m,
  '\n\n      <LazooInsights merchantId={user.id} />'
);

// Remove the blur/lock overlay on stats
code = code.replace(
  /\s*\{\/\* Stats & Gráfico \(Bloqueados si es Basic\) \*\/\}\s*<div className="relative">\s*\{isBasic && \([\s\S]*?\)\}\s*\s*<div className=\{`space-y-6 \$\{isBasic \? 'opacity-20 pointer-events-none blur-sm' : ''\}`\}>/m,
  '\n\n      {/* Stats & Gráfico */}\n      <div className="relative">\n        <div className="space-y-6">'
);

fs.writeFileSync('app/dashboard/history/page.tsx', code);
console.log('✅ history/page.tsx fixed');

// ─────────────────────────────────────────────
// 6. ProfileEditForm.tsx — Remove isPro gate on Instagram
// ─────────────────────────────────────────────
code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

// Remove isPro from interface and props
code = code.replace('  isPro?: boolean;\n', '');
code = code.replace(
  `export function ProfileEditForm({ profile, userEmail, isPro = false }: ProfileEditFormProps) {`,
  `export function ProfileEditForm({ profile, userEmail }: ProfileEditFormProps) {`
);

// Remove lock overlay
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

// Remove "Plan Pro" badge from Instagram label
code = code.replace(
  `              Instagram <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Plan Pro</span>`,
  `              Instagram`
);

// Remove disabled prop from Instagram input
code = code.replace(
  `                disabled={!isPro}
                placeholder`,
  `                placeholder`
);

// Update focus ring color from amber (pro) to blue
code = code.replace(
  'focus:ring-amber-500 transition-all disabled:opacity-50',
  'focus:ring-violet-500 transition-all'
);

fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('✅ ProfileEditForm.tsx fixed');

// ─────────────────────────────────────────────
// 7. app/dashboard/profile/page.tsx — Remove isPro
// ─────────────────────────────────────────────
code = fs.readFileSync('app/dashboard/profile/page.tsx', 'utf8');

code = code.replace(
  `  const isPro = profile.plan_type === 'pro' && profile.mp_subscription_status === 'authorized';\n`,
  ''
);
code = code.replace(' isPro={isPro}', '');

fs.writeFileSync('app/dashboard/profile/page.tsx', code);
console.log('✅ profile/page.tsx fixed');

// ─────────────────────────────────────────────
// 8. client/qr/page.tsx and dashboard/qr/page.tsx — Remove PRO sorting
// ─────────────────────────────────────────────
['app/client/qr/page.tsx', 'app/dashboard/qr/page.tsx'].forEach(filePath => {
  code = fs.readFileSync(filePath, 'utf8');
  // Remove plan_type from select
  code = code.replace(', plan_type', '');
  // Remove PRO sort logic — keep only is_featured and created_at sorting
  code = code.replace(
    `  const merchants = (merchantsData || []).sort((a, b) => {
    if (a.plan_type === 'pro' && b.plan_type !== 'pro') return -1;
    if (a.plan_type !== 'pro' && b.plan_type === 'pro') return 1;
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });`,
    `  const merchants = (merchantsData || []).sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });`
  );
  fs.writeFileSync(filePath, code);
  console.log(`✅ ${filePath} fixed`);
});

// ─────────────────────────────────────────────
// 9. app/client/map/page.tsx — Remove is_premium based on plan_type
// ─────────────────────────────────────────────
code = fs.readFileSync('app/client/map/page.tsx', 'utf8');
// Remove plan_type from select
code = code.replace(', plan_type', '');
// Set is_premium to false for all (or remove it entirely)
code = code.replace(
  `        is_premium: mother?.plan_type === 'pro'`,
  `        is_premium: false`
);
fs.writeFileSync('app/client/map/page.tsx', code);
console.log('✅ client/map/page.tsx fixed');

// ─────────────────────────────────────────────
// 10. types/index.ts — Remove plan_type and is_premium type restrictions
// ─────────────────────────────────────────────
code = fs.readFileSync('types/index.ts', 'utf8');
code = code.replace(`  plan_type?: 'basic' | 'pro' | null;\n`, `  plan_type?: string | null;\n`);
fs.writeFileSync('types/index.ts', code);
console.log('✅ types/index.ts fixed');

console.log('\n🎉 All plan restrictions removed successfully!');
