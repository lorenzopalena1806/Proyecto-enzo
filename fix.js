const fs = require('fs');
let content = fs.readFileSync('app/dashboard/history/page.tsx', 'utf8');

const importTarget = "import { MerchantChart } from '@/components/dashboard/MerchantChart';";
const importReplacement = importTarget + "\nimport { HistoryTableClient } from '@/components/dashboard/HistoryTableClient';";
content = content.replace(importTarget, importReplacement);

const chartTarget = `    const userScans = new Set();
    let nuevos = 0;
    let recurrentes = 0;
    
    txsForDay.forEach((tx: any) => {
      if (userScans.has(tx.scanned_user_id)) {
        recurrentes++;
      } else {
        nuevos++;
        userScans.add(tx.scanned_user_id);
      }
    });
    
    chartData.push({
      day: formatDay(d),
      nuevos,
      recurrentes
    });`;

const chartReplacement = `    chartData.push({
      day: formatDay(d),
      clientes: txsForDay.length
    });`;

content = content.replace(chartTarget, chartReplacement);

const listStart = '{/* Lista */}';
const listStartIdx = content.indexOf(listStart);
if (listStartIdx !== -1) {
  content = content.substring(0, listStartIdx) + '{/* Lista interactiva */}\n      <HistoryTableClient txList={txList} />\n    </div>\n  );\n}';
}

fs.writeFileSync('app/dashboard/history/page.tsx', content);
