const fs = require('fs');
let code = fs.readFileSync('components/dashboard/HistoryTableClient.tsx', 'utf8');

// Replace the flex row that holds search and filters to prevent horizontal overflow
code = code.replace(
  `<div className="flex flex-col md:flex-row gap-4">
        {/* Buscador */}
        <div className="relative flex-1">`,
  `<div className="flex flex-col md:flex-row gap-4 w-full max-w-full">
        {/* Buscador */}
        <div className="relative flex-1 min-w-0">`
);

code = code.replace(
  `<div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">`,
  `<div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar max-w-full min-w-0 w-full md:w-auto">`
);

// Fix truncate on offer title so it doesn't stretch the flex container on mobile
code = code.replace(
  `<span className="text-sm text-slate-300 truncate mr-2">{offer?.title || 'Descuento general'}</span>`,
  `<span className="text-sm text-slate-300 truncate mr-2 flex-1 min-w-0">{offer?.title || 'Descuento general'}</span>`
);

// Ensure History Table's main wrapper is completely restricted to 100vw or 100%
code = code.replace(
  `export function HistoryTableClient({ txList }: { txList: any[] }) {`,
  `export function HistoryTableClient({ txList }: { txList: any[] }) {` // just checking
);
code = code.replace(
  `return (
    <div className="space-y-4">`,
  `return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">`
);

fs.writeFileSync('components/dashboard/HistoryTableClient.tsx', code);
console.log('Fixed potential flexbox horizontal overflows on mobile in HistoryTableClient.');
