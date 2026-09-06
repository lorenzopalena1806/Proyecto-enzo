const fs = require('fs');
let code = fs.readFileSync('app/client/profile/page.tsx', 'utf8');

if (!code.includes('RestartTutorialButton')) {
  code = code.replace(
    `import { CopyCodeButton } from '@/components/client/CopyCodeButton';`,
    `import { CopyCodeButton } from '@/components/client/CopyCodeButton';\nimport { RestartTutorialButton } from '@/components/client/RestartTutorialButton';`
  );

  code = code.replace(
    `<InstallAppButton />`,
    `<InstallAppButton />\n            <div className="mt-3">\n              <RestartTutorialButton userId={user.id} />\n            </div>`
  );

  fs.writeFileSync('app/client/profile/page.tsx', code);
  console.log('Added button');
}
