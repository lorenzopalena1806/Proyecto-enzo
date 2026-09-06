const fs = require('fs');
let code = fs.readFileSync('app/dashboard/profile/page.tsx', 'utf8');

if (!code.includes('RestartTutorialButton')) {
  code = code.replace(
    `import { PushManager } from '@/components/dashboard/PushManager';`,
    `import { PushManager } from '@/components/dashboard/PushManager';\nimport { RestartTutorialButton } from '@/components/client/RestartTutorialButton';`
  );

  code = code.replace(
    `<ProfileEditForm profile={profile} userEmail={user.email || ''} isPro={isPro} />`,
    `<ProfileEditForm profile={profile} userEmail={user.email || ''} isPro={isPro} />\n      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">\n        <h2 className="text-lg font-semibold text-white">Tutorial Interactivo</h2>\n        <p className="text-sm text-slate-400">Si querés volver a ver la guía paso a paso de cómo usar tu panel, podés reiniciarla acá.</p>\n        <RestartTutorialButton userId={user.id} redirectUrl="/dashboard" text="Volver a ver el Tutorial" />\n      </div>`
  );

  fs.writeFileSync('app/dashboard/profile/page.tsx', code);
  console.log('Added to dashboard profile');
}
