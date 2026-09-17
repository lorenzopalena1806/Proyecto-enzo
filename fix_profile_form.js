const fs = require('fs');

let code = fs.readFileSync('components/dashboard/ProfileEditForm.tsx', 'utf8');

// Use string replacement for ProfileEditForm
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

code = code.replace(
  '                disabled={!isPro}\n                placeholder',
  '                placeholder'
);

code = code.replace(
  `              <span className="flex items-center gap-2">
                Instagram <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Plan Pro</span>
              </span>`,
  `              <span className="flex items-center gap-2">
                Instagram
              </span>`
);

code = code.replace(
  'export function ProfileEditForm({ profile, userEmail, isPro = false }: ProfileEditFormProps) {',
  'export function ProfileEditForm({ profile, userEmail }: ProfileEditFormProps) {'
);

code = code.replace(
  '  isPro?: boolean;\n',
  ''
);

fs.writeFileSync('components/dashboard/ProfileEditForm.tsx', code);
console.log('✅ components/dashboard/ProfileEditForm.tsx fixed via script');
