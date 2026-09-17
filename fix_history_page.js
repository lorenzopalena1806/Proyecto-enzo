const fs = require('fs');

let code = fs.readFileSync('app/dashboard/history/page.tsx', 'utf8');

// 1. Remove plan_type from select
code = code.replace(".select('role, plan_type')", ".select('role')");

// 2. Remove isBasic
code = code.replace("  const isBasic = profile?.plan_type === 'basic';\n", "");

// 3. Replace {isBasic ? (...) : (...)} with LazooInsights
const blockStart = '{isBasic ? (';
const blockEnd = '  )}';
const startIdx = code.indexOf(blockStart);
const endIdx = code.indexOf(blockEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + '<LazooInsights merchantId={user.id} />' + code.substring(endIdx + blockEnd.length);
}

// 4. Remove {isBasic && (...)} lock overlay
const lockStart = '{isBasic && (';
const lockEnd = '        )}';
const lockIdx = code.indexOf(lockStart);
const lockEndIdx = code.indexOf(lockEnd, lockIdx);

if (lockIdx !== -1 && lockEndIdx !== -1) {
    code = code.substring(0, lockIdx) + code.substring(lockEndIdx + lockEnd.length);
}

// 5. Remove className interpolation blur
code = code.replace(
    "<div className={`space-y-6 ${isBasic ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>",
    '<div className="space-y-6">'
);

fs.writeFileSync('app/dashboard/history/page.tsx', code);
console.log('✅ app/dashboard/history/page.tsx fixed');
